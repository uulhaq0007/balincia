import { ORDER_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-800",
  violet: "bg-violet-100 text-violet-800",
  indigo: "bg-indigo-100 text-indigo-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = ORDER_STATUS_META[status] ?? { label: status, tone: "amber" };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide whitespace-nowrap", TONES[meta.tone], className)}>
      {meta.label}
    </span>
  );
}
