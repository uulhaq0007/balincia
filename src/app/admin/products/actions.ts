"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { syncProductPrice } from "@/lib/catalog";
import { BOTTLE_SHAPES, CONCENTRATIONS, FAMILIES, GENDERS, GENRES, OCCASIONS, SEASONS } from "@/lib/constants";
import { db } from "@/lib/db";
import { AdminError, hexColor, isImageUrl, isUniqueViolation, optionalInt, requiredInt, type ActionState } from "@/lib/admin";
import { slugify, splitList } from "@/lib/utils";
import { firstError } from "@/lib/validators";

const oneOf = (options: readonly { value: string }[], message: string) =>
  z.string().refine((v) => options.some((o) => o.value === v), message);

const subsetOf = (options: readonly { value: string }[]) =>
  z.array(z.string()).transform((values) => options.map((o) => o.value).filter((v) => values.includes(v)));

const notes = z.string().trim().max(500).transform((v) => splitList(v).join(", "));

const variantSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().trim().min(1, "Every variant needs a label").max(40),
    sku: z.string().trim().min(1, "Every variant needs a SKU").max(60).transform((v) => v.toUpperCase()),
    price: requiredInt("Price", 0),
    compareAtPrice: optionalInt(0),
    stock: requiredInt("Stock", 0, 100000),
  })
  .refine((v) => v.compareAtPrice == null || v.compareAtPrice > v.price, {
    message: "A compare-at price must be higher than the selling price (leave it empty for no sale).",
  });

const productSchema = z.object({
  name: z.string().trim().min(2, "Give the product a name").max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .transform((v) => slugify(v)),
  tagline: z.string().trim().max(200).default(""),
  description: z.string().trim().max(6000).default(""),
  categoryId: z.string().min(1, "Choose a category"),
  gender: oneOf(GENDERS, "Choose who it's for"),
  concentration: oneOf(CONCENTRATIONS, "Choose a concentration"),
  genre: oneOf(GENRES, "Choose a genre"),
  topNotes: notes,
  heartNotes: notes,
  baseNotes: notes,
  families: subsetOf(FAMILIES),
  seasons: subsetOf(SEASONS),
  occasions: subsetOf(OCCASIONS),
  longevity: z.number().int().min(1).max(5),
  sillage: z.number().int().min(1).max(5),
  images: z
    .array(z.string().trim().refine(isImageUrl, "Image URLs must start with https:// or /"))
    .max(12, "Use at most 12 images"),
  palette: z.tuple([hexColor, hexColor]),
  bottleShape: z.enum(BOTTLE_SHAPES),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  variants: z.array(variantSchema).min(1, "Add at least one variant").max(20, "Use at most 20 variants"),
});

export async function saveProduct(productId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "The form could not be read. Please reload and try again." };
  }
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { variants, ...input } = parsed.data;

  const slug = input.slug || slugify(input.name);
  if (!slug) return { error: "Enter a slug using letters or numbers." };
  const skus = variants.map((v) => v.sku);
  const duplicateSku = skus.find((sku, i) => skus.indexOf(sku) !== i);
  if (duplicateSku) return { error: `SKU ${duplicateSku} is used on more than one variant.` };

  const data = {
    ...input,
    slug,
    families: input.families.join(","),
    seasons: input.seasons.join(","),
    occasions: input.occasions.join(","),
    images: JSON.stringify(input.images),
    palette: input.palette.join(","),
  };

  let saved: { id: string; variantIds: string[] };
  try {
    saved = await db.$transaction(async (tx) => {
      if (productId && !(await tx.product.findUnique({ where: { id: productId }, select: { id: true } })))
        throw new AdminError("This product no longer exists.");
      if (!(await tx.category.findUnique({ where: { id: data.categoryId }, select: { id: true } })))
        throw new AdminError("Choose a valid category.");

      const slugOwner = await tx.product.findUnique({ where: { slug }, select: { id: true, name: true } });
      if (slugOwner && slugOwner.id !== productId)
        throw new AdminError(`The URL slug “${slug}” is already used by ${slugOwner.name}.`);

      const skuOwner = await tx.variant.findFirst({
        where: { sku: { in: skus }, ...(productId ? { productId: { not: productId } } : {}) },
        select: { sku: true, product: { select: { name: true } } },
      });
      if (skuOwner) throw new AdminError(`SKU ${skuOwner.sku} is already used by ${skuOwner.product.name}.`);

      const product = productId
        ? await tx.product.update({ where: { id: productId }, data, select: { id: true } })
        : await tx.product.create({ data, select: { id: true } });

      const existing = await tx.variant.findMany({ where: { productId: product.id }, select: { id: true, sku: true } });
      const existingSku = new Map(existing.map((v) => [v.id, v.sku]));
      const kept = new Set(variants.flatMap((v) => (v.id && existingSku.has(v.id) ? [v.id] : [])));

      // Removed variants can go: OrderItem.variantId is SetNull, and order lines keep their own snapshot.
      const removed = existing.filter((v) => !kept.has(v.id)).map((v) => v.id);
      if (removed.length) await tx.variant.deleteMany({ where: { id: { in: removed } } });

      // Park changing SKUs first so swapping SKUs between rows doesn't trip the unique index.
      for (const v of variants) {
        if (v.id && kept.has(v.id) && existingSku.get(v.id) !== v.sku)
          await tx.variant.update({ where: { id: v.id }, data: { sku: `__tmp_${v.id}` } });
      }

      const variantIds: string[] = [];
      for (const [index, v] of variants.entries()) {
        const fields = {
          label: v.label,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
          sortOrder: index,
        };
        const row =
          v.id && kept.has(v.id)
            ? await tx.variant.update({ where: { id: v.id }, data: fields, select: { id: true } })
            : await tx.variant.create({ data: { ...fields, productId: product.id }, select: { id: true } });
        variantIds.push(row.id);
      }

      await syncProductPrice(product.id, tx);
      return { id: product.id, variantIds };
    });
  } catch (error) {
    if (error instanceof AdminError) return { error: error.message };
    if (isUniqueViolation(error)) return { error: "That slug or SKU is already in use — please choose another." };
    throw error;
  }

  revalidatePath("/", "layout");
  if (!productId) redirect(`/admin/products/${saved.id}?notice=created`);
  return { ok: true, message: "Product saved.", ids: saved.variantIds };
}

const FLAGS = ["isActive", "isFeatured", "isBestseller", "isNew"] as const;
type ProductFlag = (typeof FLAGS)[number];

export async function toggleProductFlag(productId: string, flag: ProductFlag, value: boolean) {
  await requireAdmin();
  if (!FLAGS.includes(flag) || typeof value !== "boolean") return;
  await db.product.update({ where: { id: productId }, data: { [flag]: value } });
  revalidatePath("/", "layout");
}

export async function deleteProduct(productId: string): Promise<ActionState> {
  await requireAdmin();
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, _count: { select: { orderItems: true } } },
  });
  if (!product) return { error: "This product no longer exists." };

  // Products with sales history are archived so order records keep their links.
  const archived = product._count.orderItems > 0;
  if (archived) await db.product.update({ where: { id: productId }, data: { isActive: false } });
  else await db.product.delete({ where: { id: productId } });

  revalidatePath("/", "layout");
  redirect(`/admin/products?notice=${archived ? "archived" : "deleted"}`);
}
