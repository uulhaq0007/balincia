"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/store/ui";
import { ProductGrid } from "./ProductRail";

export function WishlistClient() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!mounted) return;
    if (!key) {
      setProducts([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/products?ids=${key}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [key, mounted]);

  // Keep removed items out immediately without waiting for a refetch.
  const visible = products?.filter((p) => ids.includes(p.id)) ?? null;

  return (
    <div className="container-x py-10 md:py-14">
      <p className="eyebrow">Saved for later</p>
      <h1 className="mt-2 font-display text-5xl">
        Wishlist {visible && visible.length > 0 && <span className="text-2xl text-muted">({visible.length})</span>}
      </h1>
      <div className="mt-10">
        {visible === null ? (
          <div className="flex justify-center py-20">
            <LoaderCircle className="animate-spin text-muted" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-20 text-center">
            <Heart size={36} strokeWidth={1.3} className="text-gold" />
            <p className="mt-4 font-display text-3xl">Nothing saved yet</p>
            <p className="mt-2 text-ink-soft">Tap the heart on any scent to keep it here.</p>
            <Link href="/shop" className="btn btn-primary mt-6">Explore the library</Link>
          </div>
        ) : (
          <ProductGrid products={visible} />
        )}
      </div>
    </div>
  );
}
