import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";

export function FreeShippingMeter({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div className="rounded-xl bg-paper-2 px-4 py-3">
      <p className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
        <Truck size={16} className="shrink-0 text-gold" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong className="text-ink">{formatPrice(remaining)}</strong> away from free delivery
          </span>
        ) : (
          <span>
            <strong className="text-ink">Free delivery</strong> unlocked — nice!
          </span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-3">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
