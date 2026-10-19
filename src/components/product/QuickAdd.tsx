"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn, parseImages } from "@/lib/utils";

type Variant = { id: string; label: string; price: number; compareAtPrice: number | null; stock: number };
type Props = {
  product: { id: string; slug: string; name: string; palette: string; bottleShape: string; images: string };
  variants: Variant[];
};

export function QuickAdd({ product, variants }: Props) {
  const add = useCart((s) => s.add);
  const available = variants.filter((v) => v.stock > 0);

  const addVariant = (v: Variant) =>
    add({
      variantId: v.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantLabel: v.label,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      palette: product.palette,
      bottleShape: product.bottleShape,
      image: parseImages(product.images)[0] ?? null,
      maxStock: v.stock,
    });

  if (available.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute inset-x-3 bottom-3 z-10 flex gap-1.5 transition-all duration-300",
        "translate-y-0 opacity-100 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100",
      )}
    >
      {variants.length === 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addVariant(variants[0]);
          }}
          className="btn btn-sm w-full bg-paper/95 text-ink shadow-sm backdrop-blur hover:bg-ink hover:text-paper"
        >
          <Plus size={14} /> Add to bag
        </button>
      ) : (
        variants.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={v.stock <= 0}
            onClick={(e) => {
              e.preventDefault();
              addVariant(v);
            }}
            className="btn btn-sm flex-1 bg-paper/95 px-2 text-ink shadow-sm backdrop-blur hover:bg-ink hover:text-paper disabled:line-through"
            aria-label={`Add ${product.name} ${v.label} to bag`}
          >
            <Plus size={12} className="hidden sm:block" /> {v.label}
          </button>
        ))
      )}
    </div>
  );
}
