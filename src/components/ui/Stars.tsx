"use client";

// Client component + two SVGs (instead of ten icon SVGs) keeps ratings cheap on
// pages that list dozens of products.
import { cn } from "@/lib/utils";

const STAR = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26";

function Row({ size, className }: { size: number; className: string }) {
  return (
    <svg width={Math.round((size * 128) / 24)} height={size} viewBox="0 0 128 24" className={className} aria-hidden fill="currentColor">
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon key={i} points={STAR} transform={`translate(${i * 26} 0)`} />
      ))}
    </svg>
  );
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  const pct = (Math.max(0, Math.min(5, rating)) / 5) * 100;
  return (
    <span className={cn("relative inline-flex shrink-0", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <Row size={size} className="text-gold/30" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Row size={size} className="max-w-none text-gold" />
      </span>
    </span>
  );
}
