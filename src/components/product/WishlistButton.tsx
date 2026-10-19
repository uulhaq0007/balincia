"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/store/ui";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, name, className, withLabel = false }: { productId: string; name: string; className?: string; withLabel?: boolean }) {
  const mounted = useMounted();
  const toggle = useWishlist((s) => s.toggle);
  const saved = useWishlist((s) => s.ids.includes(productId)) && mounted;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all",
        withLabel ? "btn btn-outline" : "grid h-9 w-9 place-items-center rounded-full bg-paper/85 backdrop-blur hover:bg-paper",
        className,
      )}
    >
      <Heart size={withLabel ? 16 : 17} strokeWidth={1.7} className={cn(saved ? "fill-sale text-sale" : "")} />
      {withLabel && (saved ? "Saved" : "Wishlist")}
    </button>
  );
}
