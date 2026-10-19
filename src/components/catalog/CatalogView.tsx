import Link from "next/link";
import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { getCatalog, parseFilters } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductRail";
import { BottleArt } from "@/components/product/BottleArt";
import { FilterSidebar, MobileFilterButton } from "./FilterPanel";
import { ActiveFilters, SortSelect } from "./Toolbar";
import { Pagination } from "./Pagination";
import { parsePalette } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  palette?: string;
  basePath: string;
  where: Prisma.ProductWhereInput;
  searchParams: Record<string, string | string[] | undefined>;
  defaultSort?: string;
  hideFilters?: string[];
  crumbs?: { label: string; href: string }[];
};

export async function CatalogView({ title, description, palette, basePath, where, searchParams, defaultSort = "featured", hideFilters, crumbs = [] }: Props) {
  const filters = parseFilters(searchParams);
  if (!searchParams.sort) filters.sort = defaultSort;
  const { products, total, pages } = await getCatalog(where, filters);
  const [dark, light] = parsePalette(palette);

  return (
    <>
      <section className="container-x pt-4">
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-10 md:px-12 md:py-14" style={{ background: `linear-gradient(120deg, ${light}40, ${light}a0)` }}>
          <nav aria-label="Breadcrumb" className="relative z-10 text-xs text-ink-soft">
            <Link href="/" className="hover:text-ink">Home</Link>
            {crumbs.map((c) => (
              <span key={c.href}>
                <span className="mx-2">/</span>
                <Link href={c.href} className="hover:text-ink">{c.label}</Link>
              </span>
            ))}
            <span className="mx-2">/</span>
            <span className="text-ink">{title}</span>
          </nav>
          <h1 className="relative z-10 mt-4 font-display text-4xl leading-none md:text-6xl" style={{ color: dark }}>
            {title}
          </h1>
          {description && <p className="relative z-10 mt-4 max-w-xl text-ink-soft">{description}</p>}
          <p className="relative z-10 mt-4 text-xs font-bold tracking-[0.16em] text-muted uppercase">
            {total} {total === 1 ? "scent" : "scents"}
          </p>
          <BottleArt palette={[dark, light]} shape="classic" bare className="absolute -right-6 -bottom-16 hidden h-72 w-56 rotate-6 opacity-70 md:block" />
          <BottleArt palette={[dark, light]} shape="round" bare className="absolute right-40 -bottom-20 hidden h-56 w-44 -rotate-6 opacity-40 lg:block" />
        </div>
      </section>

      <section className="container-x mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <Suspense>
          <FilterSidebar hide={hideFilters} />
        </Suspense>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Suspense>
              <MobileFilterButton hide={hideFilters} count={total} />
              <div className="hidden min-h-8 flex-1 lg:block">
                <ActiveFilters />
              </div>
              <SortSelect defaultSort={defaultSort} />
            </Suspense>
          </div>
          <div className="mb-6 lg:hidden">
            <Suspense>
              <ActiveFilters />
            </Suspense>
          </div>
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-3xl border border-dashed border-line px-6 py-20 text-center">
              <p className="font-display text-3xl">No scents match these filters</p>
              <p className="mt-2 text-ink-soft">Try removing a filter or two — or explore our best sellers.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href={basePath} className="btn btn-outline btn-sm">Clear filters</Link>
                <Link href="/collections/best-sellers" className="btn btn-primary btn-sm">Best sellers</Link>
              </div>
            </div>
          )}
          <Pagination page={filters.page} pages={pages} basePath={basePath} searchParams={searchParams} />
        </div>
      </section>
    </>
  );
}
