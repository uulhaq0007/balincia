import { ORDER_STATUS_META } from "@/lib/constants";
import { PAYMENT_STATUS_TONE, PILL_TONES } from "@/lib/admin";
import { cn, titleCase } from "@/lib/utils";

export function Pill({ tone = "stone", children, className }: { tone?: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold",
        PILL_TONES[tone] ?? PILL_TONES.stone,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusPill({ status }: { status: string }) {
  const meta = ORDER_STATUS_META[status];
  return <Pill tone={meta?.tone}>{titleCase(status)}</Pill>;
}

export function PaymentStatusPill({ status }: { status: string }) {
  return <Pill tone={PAYMENT_STATUS_TONE[status]}>{titleCase(status)}</Pill>;
}
