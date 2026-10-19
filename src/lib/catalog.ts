import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { VIRTUAL_COLLECTIONS } from "./constants";
import { param } from "./utils";

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  price: true,
  compareAtPrice: true,
  images: true,
  palette: true,
  bottleShape: true,
  ratingAvg: true,
  ratingCount: true,
  isNew: true,
  isBestseller: true,
  concentration: true,
  gender: true,
  families: true,
  category: { select: { name: true, slug: true } },
  variants: {
    select: { id: true, label: true, price: true, compareAtPrice: true, stock: true },
    orderBy: { sortOrder: "asc" },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export type CatalogFilters = {
  q?: string;
  gender?: string[];
  family?: string[];
  season?: string[];
  genre?: string[];
  occasion?: string[];
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  longevity?: number;
  sale?: boolean;
  sort: string;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
}

export function parseFilters(sp: SearchParams): CatalogFilters {
  const num = (v: string | undefined) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
  return {
    q: param(sp.q)?.trim() || undefined,
    gender: list(sp.gender),
    family: list(sp.family),
    season: list(sp.season),
    genre: list(sp.genre),
    occasion: list(sp.occasion),
    category: list(sp.category),
    minPrice: num(param(sp.min)),
    maxPrice: num(param(sp.max)),
    longevity: num(param(sp.longevity)),
    sale: param(sp.sale) === "1",
    sort: param(sp.sort) ?? "featured",
    page: Math.max(1, num(param(sp.page)) ?? 1),
  };
}

function anyContains(field: "families" | "seasons" | "occasions", values?: string[]): Prisma.ProductWhereInput | null {
  if (!values?.length) return null;
  return { OR: values.map((v) => ({ [field]: { contains: v } })) };
}

export function filtersToWhere(f: CatalogFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isActive: true }];
  if (f.q) {
    and.push({
      OR: [
        { name: { contains: f.q, mode: "insensitive" } },
        { tagline: { contains: f.q, mode: "insensitive" } },
        { topNotes: { contains: f.q, mode: "insensitive" } },
        { heartNotes: { contains: f.q, mode: "insensitive" } },
        { baseNotes: { contains: f.q, mode: "insensitive" } },
        { families: { contains: f.q.toLowerCase() } },
        { category: { name: { contains: f.q, mode: "insensitive" } } },
      ],
    });
  }
  if (f.gender?.length) and.push({ gender: { in: f.gender } });
  if (f.genre?.length) and.push({ genre: { in: f.genre } });
  if (f.category?.length) and.push({ category: { slug: { in: f.category } } });
  for (const clause of [
    anyContains("families", f.family),
    anyContains("seasons", f.season),
    anyContains("occasions", f.occasion),
  ]) {
    if (clause) and.push(clause);
  }
  if (f.minPrice != null) and.push({ price: { gte: f.minPrice } });
  if (f.maxPrice != null) and.push({ price: { lte: f.maxPrice } });
  if (f.longevity) and.push({ longevity: { gte: f.longevity } });
  if (f.sale) and.push({ compareAtPrice: { not: null } });
  return { AND: and };
}

export function sortToOrderBy(sort: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
      return [{ soldCount: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }];
  }
}

export const PAGE_SIZE = 12;

export async function getCatalog(base: Prisma.ProductWhereInput, filters: CatalogFilters) {
  const where: Prisma.ProductWhereInput = { AND: [base, filtersToWhere(filters)] };
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: sortToOrderBy(filters.sort),
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productCardSelect,
    }),
  ]);
  return { products, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Resolve a /collections/[slug] into a title + base where clause. */
export async function resolveCollection(slug: string) {
  const virtual = VIRTUAL_COLLECTIONS[slug];
  if (virtual) {
    const where: Record<string, Prisma.ProductWhereInput> = {
      "best-sellers": { isBestseller: true },
      "new-arrivals": { isNew: true },
      "under-2000": { price: { lte: 2000 } },
      oud: { OR: [{ families: { contains: "oud" } }, { name: { contains: "oud", mode: "insensitive" } }] },
      sale: { compareAtPrice: { not: null } },
      men: { gender: { in: ["MEN", "UNISEX"] }, concentration: { notIn: ["HOME", "SET"] } },
      women: { gender: { in: ["WOMEN", "UNISEX"] }, concentration: { notIn: ["HOME", "SET"] } },
      unisex: { gender: "UNISEX", concentration: { notIn: ["HOME", "SET"] } },
    };
    return {
      name: virtual.name,
      description: virtual.description,
      palette: virtual.palette,
      where: where[slug] ?? {},
      defaultSort: slug === "best-sellers" ? "popular" : slug === "new-arrivals" ? "newest" : "featured",
    };
  }
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return null;
  return {
    name: category.name,
    description: category.description,
    palette: category.palette,
    where: { categoryId: category.id } as Prisma.ProductWhereInput,
    defaultSort: "featured",
  };
}

export async function getProductRail(where: Prisma.ProductWhereInput, orderBy?: Prisma.ProductOrderByWithRelationInput[], take = 8) {
  return db.product.findMany({
    where: { AND: [{ isActive: true }, where] },
    orderBy: orderBy ?? [{ isFeatured: "desc" }, { soldCount: "desc" }],
    take,
    select: productCardSelect,
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: { orderBy: { sortOrder: "asc" } },
      reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
}

export async function recomputeProductRating(productId: string) {
  const agg = await db.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.product.update({
    where: { id: productId },
    data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count._all },
  });
}

/** Keep Product.price / compareAtPrice in sync with its cheapest variant. */
export async function syncProductPrice(productId: string, tx: Prisma.TransactionClient | typeof db = db) {
  const variants = await tx.variant.findMany({ where: { productId }, orderBy: { price: "asc" } });
  const cheapest = variants[0];
  await tx.product.update({
    where: { id: productId },
    data: {
      price: cheapest?.price ?? 0,
      compareAtPrice: cheapest?.compareAtPrice && cheapest.compareAtPrice > cheapest.price ? cheapest.compareAtPrice : null,
    },
  });
}
