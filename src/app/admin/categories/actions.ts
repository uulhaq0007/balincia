"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { VIRTUAL_COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/db";
import { checkbox, formToObject, hexColor, isUniqueViolation, requiredInt, type ActionState } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { firstError } from "@/lib/validators";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Give the category a name").max(80),
  slug: z.string().trim().max(80).default(""),
  description: z.string().trim().max(600).default(""),
  palette: z
    .string()
    .transform((v) => v.split(","))
    .pipe(z.tuple([hexColor, hexColor])),
  sortOrder: requiredInt("Sort order", -1000, 1000),
  showInNav: checkbox,
});

export async function saveCategory(categoryId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const slug = slugify(input.slug || input.name);
  if (!slug) return { error: "Enter a slug using letters or numbers." };
  if (slug in VIRTUAL_COLLECTIONS) return { error: `“${slug}” is reserved for a built-in collection. Choose another slug.` };

  const owner = await db.category.findUnique({ where: { slug }, select: { id: true, name: true } });
  if (owner && owner.id !== categoryId) return { error: `The slug “${slug}” is already used by ${owner.name}.` };

  const data = { ...input, slug, palette: input.palette.join(",") };
  try {
    if (categoryId) await db.category.update({ where: { id: categoryId }, data });
    else await db.category.create({ data });
  } catch (error) {
    if (isUniqueViolation(error)) return { error: "That slug is already in use." };
    throw error;
  }

  revalidatePath("/", "layout");
  return { ok: true, message: categoryId ? "Category saved." : `${input.name} created.` };
}

export async function deleteCategory(categoryId: string): Promise<ActionState> {
  await requireAdmin();
  const products = await db.product.count({ where: { categoryId } });
  if (products > 0)
    return { error: `This category still has ${products} product${products === 1 ? "" : "s"}. Move or delete them first.` };
  await db.category.deleteMany({ where: { id: categoryId } });
  revalidatePath("/", "layout");
  return null;
}
