import { Check, X } from "lucide-react";
import { ORDER_STATUS_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

type Props = {
  status: string;
  events: { status: string; note: string; createdAt: Date | string }[];
  courier?: string | null;
  trackingNumber?: string | null;
};

export function OrderTimeline({ status, events, courier, trackingNumber }: Props) {
  const cancelled = status === "CANCELLED";
  const reached = FLOW.indexOf(status);
  const eventFor = (s: string) => [...events].reverse().find((e) => e.status === s);

  return (
    <div>
      {cancelled ? (
        <div className="flex items-center gap-3 rounded-2xl bg-sale/10 p-4 text-sale">
          <X size={20} />
          <div>
            <p className="font-semibold">This order was cancelled</p>
            {eventFor("CANCELLED")?.note && <p className="text-sm">{eventFor("CANCELLED")?.note}</p>}
          </div>
        </div>
      ) : (
        <ol className="relative grid grid-cols-5">
          {FLOW.map((s, i) => {
            const done = i <= reached;
            const event = eventFor(s);
            return (
              <li key={s} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span className={cn("absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2", i <= reached ? "bg-gold" : "bg-paper-3")} aria-hidden />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold",
                    done ? "border-gold bg-gold text-white" : "border-paper-3 bg-paper text-muted",
                    i === reached && "ring-4 ring-gold/20",
                  )}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("mt-2 text-[0.68rem] leading-tight font-semibold sm:text-xs", done ? "text-ink" : "text-muted")}>
                  {ORDER_STATUS_META[s].label}
                </span>
                {event && <span className="mt-0.5 hidden text-[0.65rem] text-muted sm:block">{formatDateTime(event.createdAt)}</span>}
              </li>
            );
          })}
        </ol>
      )}
      {trackingNumber && (
        <p className="mt-6 rounded-xl bg-paper-2 px-4 py-3 text-sm">
          Shipped with <strong>{courier ?? "our courier"}</strong> · Tracking # <strong className="tabular-nums">{trackingNumber}</strong>
        </p>
      )}
    </div>
  );
}
