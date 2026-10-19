"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag, Trash2 } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { useMounted } from "@/store/ui";
import { ProductImage } from "@/components/product/ProductImage";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { QuantityStepper } from "./QuantityStepper";
import { formatPrice } from "@/lib/format";

export function CartPageClient({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const mounted = useMounted();
  const { items, setQuantity, remove } = useCart();

  if (!mounted) return <div className="container-x min-h-[50vh] py-16" />;

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-paper-2">
          <ShoppingBag size={36} strokeWidth={1.3} className="text-gold" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-ink-soft">Let&apos;s find a scent worth remembering.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/collections/best-sellers" className="btn btn-primary">Shop best sellers</Link>
          <Link href="/quiz" className="btn btn-outline">Take the quiz</Link>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const savings = items.reduce((s, i) => s + (i.compareAtPrice && i.compareAtPrice > i.price ? (i.compareAtPrice - i.price) * i.quantity : 0), 0);

  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="font-display text-5xl">
        Your bag <span className="text-2xl text-muted">({cartCount(items)})</span>
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-5 py-6">
              <Link href={`/products/${item.slug}`} className="h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-paper-2 md:h-44 md:w-36">
                <ProductImage product={item} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-display text-2xl leading-tight hover:text-gold">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{item.variantLabel}</p>
                    <p className="mt-2 text-sm">
                      {formatPrice(item.price)}
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="ml-2 text-xs text-muted line-through">{formatPrice(item.compareAtPrice)}</span>
                      )}
                    </p>
                  </div>
                  <p className="font-display text-xl tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center gap-4 pt-4">
                  <QuantityStepper value={item.quantity} max={item.maxStock} onChange={(q) => setQuantity(item.variantId, q)} />
                  <button onClick={() => remove(item.variantId)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-sale">
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="card space-y-5 p-6">
            <FreeShippingMeter subtotal={subtotal} threshold={freeShippingThreshold} />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sale">
                  <dt>You save</dt>
                  <dd className="tabular-nums">{formatPrice(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="text-ink-soft">Calculated at checkout</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm font-bold tracking-wider uppercase">Estimated total</span>
              <span className="font-display text-3xl tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary w-full">
              <Lock size={15} /> Secure checkout <ArrowRight size={15} />
            </Link>
            <p className="text-center text-xs text-muted">Cash on Delivery · Bank Transfer · JazzCash / Easypaisa</p>
          </div>
          <Link href="/shop" className="mt-4 block text-center text-sm text-ink-soft underline underline-offset-4">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
