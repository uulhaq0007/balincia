"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { WishlistButton } from "./WishlistButton";
import { Price } from "@/components/ui/Price";
import { formatPrice } from "@/lib/format";
import { cn, discountPercent, parseImages } from "@/lib/utils";

type Variant = { id: string; label: string; price: number; compareAtPrice: number | null; stock: number };
type Props = {
  product: { id: string; slug: string; name: string; palette: string; bottleShape: string; images: string };
  variants: Variant[];
  freeShippingThreshold: number;
};

export function PurchasePanel({ product, variants, freeShippingThreshold }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const close = useCart((s) => s.close);
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? firstAvailable;
  if (!variant) return null;
  const soldOut = variant.stock <= 0;
  const off = discountPercent(variant.price, variant.compareAtPrice);

  const addToCart = () => {
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: variant.label,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        palette: product.palette,
        bottleShape: product.bottleShape,
        image: parseImages(product.images)[0] ?? null,
        maxStock: variant.stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Price price={variant.price} compareAtPrice={variant.compareAtPrice} size="lg" />
        {off > 0 && <span className="rounded-full bg-sale px-2.5 py-1 text-[0.65rem] font-bold tracking-wider text-white uppercase">Save {off}%</span>}
      </div>
      <p className="mt-1 text-xs text-muted">
        Tax included.{freeShippingThreshold > 0 && ` Free delivery over ${formatPrice(freeShippingThreshold)}.`}
      </p>

      <fieldset className="mt-7">
        <legend className="label">Size — {variant.label}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setVariantId(v.id);
                setQuantity(1);
              }}
              aria-pressed={v.id === variant.id}
              className={cn(
                "relative flex min-w-24 flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition-all",
                v.id === variant.id ? "border-ink bg-ink text-paper" : "border-line bg-white/70 hover:border-ink-soft",
                v.stock <= 0 && "opacity-50",
              )}
            >
              <span className="text-sm font-bold">{v.label}</span>
              <span className={cn("text-xs", v.id === variant.id ? "text-paper/70" : "text-muted")}>
                {v.stock <= 0 ? "Sold out" : `Rs. ${v.price.toLocaleString()}`}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <p className={cn("mt-5 flex items-center gap-2 text-sm", soldOut ? "text-sale" : variant.stock <= 5 ? "text-gold" : "text-sage")}>
        <span className={cn("h-2 w-2 rounded-full", soldOut ? "bg-sale" : variant.stock <= 5 ? "bg-gold animate-pulse" : "bg-sage")} />
        {soldOut ? "Sold out — check back soon" : variant.stock <= 5 ? `Only ${variant.stock} left in stock` : "In stock, ready to ship"}
      </p>

      <div className="mt-5 flex gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, variant.stock)} />
        <button type="button" disabled={soldOut} onClick={addToCart} className="btn btn-primary flex-1">
          {added ? <Check size={16} /> : <ShoppingBag size={16} />}
          {soldOut ? "Sold out" : added ? "Added to bag" : "Add to bag"}
        </button>
        <WishlistButton productId={product.id} name={product.name} className="h-12 w-12 border border-line bg-white/70" />
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          addToCart();
          close();
          router.push("/checkout");
        }}
        className="btn btn-gold mt-3 w-full"
      >
        Buy it now
      </button>
    </div>
  );
}
