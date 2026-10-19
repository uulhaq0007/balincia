"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { useMounted, useScrollLock } from "@/store/ui";
import { ProductImage } from "@/components/product/ProductImage";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { QuantityStepper } from "./QuantityStepper";
import { formatPrice } from "@/lib/format";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const mounted = useMounted();
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const pathname = usePathname();
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => close(), [pathname, close]);

  if (!mounted || !isOpen) return null;
  const subtotal = cartSubtotal(items);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={close} />
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">
            Your bag <span className="text-base text-muted">({cartCount(items)})</span>
          </h2>
          <button onClick={close} className="rounded-full p-2 hover:bg-paper-2" aria-label="Close bag">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-2">
              <ShoppingBag size={30} strokeWidth={1.4} className="text-gold" />
            </div>
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="text-sm text-ink-soft">Discover a scent that tells your story.</p>
            <Link href="/collections/best-sellers" onClick={close} className="btn btn-primary mt-2">
              Shop best sellers
            </Link>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <FreeShippingMeter subtotal={subtotal} threshold={freeShippingThreshold} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link href={`/products/${item.slug}`} onClick={close} className="h-28 w-[5.6rem] shrink-0 overflow-hidden rounded-xl bg-paper-2">
                    <ProductImage product={item} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/products/${item.slug}`} onClick={close} className="font-display text-lg leading-tight hover:text-gold">
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted">{item.variantLabel}</p>
                      </div>
                      <button onClick={() => remove(item.variantId)} className="p-1 text-muted hover:text-sale" aria-label={`Remove ${item.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) => setQuantity(item.variantId, q)}
                      />
                      <span className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    {item.quantity >= item.maxStock && (
                      <p className="mt-1 text-[0.7rem] text-sale">Max available quantity reached</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wider uppercase">Subtotal</span>
                <span className="font-display text-2xl tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Taxes included. Shipping & discount codes calculated at checkout.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={close} className="btn btn-outline">
                  View bag
                </Link>
                <Link href="/checkout" onClick={close} className="btn btn-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
