import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Package, Pencil, Plus, Star } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FlagToggle } from "@/components/admin/FlagToggle";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { SearchForm } from "@/components/admin/SearchForm";
import { ProductImage } from "@/components/product/ProductImage";
import { ADMIN_PAGE_SIZE, pageCount, readPage, readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleProductFlag } from "./actions";

export const metadata = { title: "Products" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const NOTICES: Record<string, string> = {
  deleted: "Product deleted.",
  archived: "That product has order history, so it was archived — hidden from the store but kept for your records.",
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = readParam(sp, "q");
  const category = readParam(sp, "category");
  const status = readParam(sp, "status");
  const noticeKey = readParam(sp, "notice");
  const notice = noticeKey && Object.hasOwn(NOTICES, noticeKey) ? NOTICES[noticeKey] : undefined;
  const page = readPage(sp);

  const and: Prisma.ProductWhereInput[] = [];
  if (q)
    and.push({
      OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }],
    });
  if (category) and.push({ categoryId: category });
  if (status === "active") and.push({ isActive: true });
  if (status === "inactive") and.push({ isActive: false });
  const where: Prisma.ProductWhereInput = { AND: and };

  const [categories, total, products] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        palette: true,
        bottleShape: true,
        price: true,
        soldCount: true,
        ratingAvg: true,
        ratingCount: true,
        isActive: true,
        isFeatured: true,
        category: { select: { name: true } },
        variants: { select: { price: true, stock: true } },
      },
    }),
  ]);

  return (
    <div>
      <PageHeader eyebrow="Catalogue" title="Products" description="Fragrances, variants, stock and merchandising flags.">
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> New product
        </Link>
      </PageHeader>

      {notice && <Notice>{notice}</Notice>}

      <div className="card overflow-hidden">
        <div className="border-b border-line p-4">
          <SearchForm action="/admin/products" defaultValue={q} placeholder="Search by name, slug or SKU">
            <select name="category" defaultValue={category ?? ""} className="input h-11 sm:w-48" aria-label="Category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={status ?? ""} className="input h-11 sm:w-36" aria-label="Status">
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </SearchForm>
        </div>

        {products.length === 0 ? (
          <EmptyState icon={Package} title="No products found">
            {q || category || status ? "Try different filters." : "Add your first fragrance to get started."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 text-right font-semibold">Price</th>
                  <th className="px-3 py-3 text-right font-semibold">Stock</th>
                  <th className="px-3 py-3 text-right font-semibold">Sold</th>
                  <th className="px-3 py-3 font-semibold">Rating</th>
                  <th className="px-3 py-3 font-semibold">Active</th>
                  <th className="px-3 py-3 font-semibold">Featured</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {products.map((product) => {
                  const prices = product.variants.map((v) => v.price);
                  const minPrice = prices.length ? Math.min(...prices) : product.price;
                  const varies = new Set(prices).size > 1;
                  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  return (
                    <tr key={product.id} className={cn("transition hover:bg-paper/60", !product.isActive && "text-muted")}>
                      <td className="px-5 py-3">
                        <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                          <span className={cn("h-14 w-11 shrink-0 overflow-hidden rounded-md bg-paper-2", !product.isActive && "opacity-60")}>
                            <ProductImage product={product} />
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[260px] truncate font-semibold text-ink hover:text-gold">{product.name}</span>
                            <span className="block text-xs text-muted">
                              {product.variants.length} {product.variants.length === 1 ? "variant" : "variants"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{product.category.name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        {varies && <span className="mr-1 text-[0.65rem] uppercase tracking-wider text-muted">from</span>}
                        <span className="font-semibold text-ink">{formatPrice(minPrice)}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className={cn(stock === 0 ? "font-semibold text-sale" : stock <= 5 ? "font-semibold text-amber-700" : "text-ink-soft")}>
                          {stock === 0 ? "Out" : stock.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{product.soldCount.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        {product.ratingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-ink-soft">
                            <Star size={13} className="text-gold" fill="currentColor" strokeWidth={0} />
                            <span className="tabular-nums">{product.ratingAvg.toFixed(1)}</span>
                            <span className="text-xs text-muted">({product.ratingCount})</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <FlagToggle
                          action={toggleProductFlag.bind(null, product.id, "isActive")}
                          checked={product.isActive}
                          label={`${product.name} active`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <FlagToggle
                          action={toggleProductFlag.bind(null, product.id, "isFeatured")}
                          checked={product.isFeatured}
                          label={`${product.name} featured`}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pages={pageCount(total)}
        total={total}
        basePath="/admin/products"
        params={{ q, category, status }}
        noun={total === 1 ? "product" : "products"}
      />
    </div>
  );
}
