import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";
import { WishlistButton } from "./WishlistButton";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { cn, discountPercent } from "@/lib/utils";

const concentrationShort: Record<string, string> = {
  EDP: "Eau de Parfum",
  EDT: "Eau de Toilette",
  EXTRAIT: "Extrait",
  PARFUM: "Parfum",
  ATTAR: "Attar",
  MIST: "Body Mist",
  HOME: "Home",
  SET: "Set",
};

export function ProductCard({ product, className }: { product: ProductCardData; className?: string }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.variants.length > 0 && product.variants.every((v) => v.stock <= 0);
  const prices = new Set(product.variants.map((v) => v.price));

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2">
          <ProductImage
            product={product}
            className="transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {soldOut && <Badge tone="ink">Sold out</Badge>}
            {!soldOut && off > 0 && <Badge tone="sale">−{off}%</Badge>}
            {product.isNew && <Badge tone="light">New</Badge>}
            {product.isBestseller && !product.isNew && <Badge tone="gold">Bestseller</Badge>}
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <WishlistButton productId={product.id} name={product.name} />
      </div>
      {!soldOut && (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5] [&>*]:pointer-events-auto">
          <QuickAdd product={product} variants={product.variants} />
        </div>
      )}

      <div className="mt-3.5 px-0.5">
        <p className="truncate text-[0.65rem] font-bold tracking-[0.18em] text-muted uppercase">
          {product.category.name} · {concentrationShort[product.concentration] ?? product.concentration}
        </p>
        <h3 className="mt-1 font-display text-[1.2rem] leading-tight">
          <Link href={`/products/${product.slug}`} className="hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[0.8rem] text-ink-soft">{product.tagline}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} from={prices.size > 1} />
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Stars rating={product.ratingAvg} size={12} />
              <span>({product.ratingCount})</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Badge({ tone, children }: { tone: "sale" | "gold" | "light" | "ink"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] uppercase",
        tone === "sale" && "bg-sale text-white",
        tone === "gold" && "bg-ink text-gold-2",
        tone === "light" && "bg-paper text-ink",
        tone === "ink" && "bg-ink/80 text-paper",
      )}
    >
      {children}
    </span>
  );
}
