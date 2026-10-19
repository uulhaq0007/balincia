import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  href?: string;
  products: ProductCardData[];
  description?: string;
};

/** Horizontal snap-scroller on mobile, 4-up grid on desktop. */
export function ProductRail({ eyebrow, title, href, products, description }: Props) {
  if (!products.length) return null;
  return (
    <section className="container-x py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-3xl leading-tight md:text-[2.6rem]">{title}</h2>
          {description && <p className="mt-2 max-w-xl text-sm text-ink-soft">{description}</p>}
        </div>
        {href && (
          <Link href={href} className="group hidden shrink-0 items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase sm:inline-flex">
            <span className="link-underline">Explore all</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} className="w-[68%] shrink-0 snap-start sm:w-[42%] md:w-auto" />
        ))}
      </div>
      {href && (
        <Link href={href} className="btn btn-outline btn-sm mt-8 w-full sm:hidden">
          Explore all
        </Link>
      )}
    </section>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
