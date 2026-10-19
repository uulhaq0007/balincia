import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: React.ReactNode;
  /** Percent change vs. the previous period; omitted when not comparable. */
  delta?: number | null;
};

export function Kpi({ label, value, icon: Icon, hint, delta }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-2 text-gold">
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-[1.9rem] leading-none text-ink tabular-nums">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted">
        {delta != null && Number.isFinite(delta) && (
          <span className={cn("font-semibold", delta >= 0 ? "text-sage" : "text-sale")}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}%
          </span>
        )}
        {hint}
      </div>
    </div>
  );
}
