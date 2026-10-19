import { formatPrice } from "@/lib/format";

type Point = { date: Date; revenue: number; orders: number };

function niceCeil(value: number) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function compact(amount: number) {
  if (amount >= 1_000_000) return `${+(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `${+(amount / 1000).toFixed(1)}k`;
  return String(amount);
}

const dayLabel = (d: Date) => d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });

/** Single-series daily revenue bars drawn with plain HTML — no chart library. */
export function RevenueChart({ data }: { data: Point[] }) {
  const max = niceCeil(Math.max(0, ...data.map((d) => d.revenue)));
  const ticks = [max, max / 2, 0];

  return (
    <div>
      <div className="relative flex h-52 gap-3">
        <div className="relative w-10 shrink-0 text-right text-[0.65rem] text-muted tabular-nums" aria-hidden>
          {ticks.map((t, i) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t, i) => (
            <div
              key={t}
              className={i === ticks.length - 1 ? "absolute inset-x-0 border-t border-ink/25" : "absolute inset-x-0 border-t border-dashed border-line"}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
              aria-hidden
            />
          ))}
          <div className="relative flex h-full items-end gap-[2px]">
            {data.map((d) => {
              const pct = (d.revenue / max) * 100;
              return (
                <div
                  key={d.date.toISOString()}
                  tabIndex={0}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                  aria-label={`${dayLabel(d.date)}: ${formatPrice(d.revenue)} from ${d.orders} orders`}
                >
                  <div
                    className={
                      d.revenue > 0
                        ? "w-full max-w-7 rounded-t-[4px] bg-gold-2 transition-colors group-hover:bg-gold group-focus-visible:bg-gold"
                        : "h-[2px] w-full max-w-7 rounded-full bg-paper-3"
                    }
                    style={d.revenue > 0 ? { height: `${Math.max(pct, 1.5)}%` } : undefined}
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[0.7rem] leading-tight text-paper shadow-lg group-hover:block group-focus-visible:block"
                    style={{ bottom: `calc(${pct}% + 8px)` }}
                  >
                    <span className="block text-paper/60">{dayLabel(d.date)}</span>
                    <span className="block font-semibold tabular-nums">{formatPrice(d.revenue)}</span>
                    <span className="block text-paper/60">
                      {d.orders} {d.orders === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-[3.25rem] mt-2 flex gap-[2px] text-center text-[0.65rem] text-muted tabular-nums" aria-hidden>
        {data.map((d, i) => (
          <span key={d.date.toISOString()} className="flex-1 truncate">
            {(data.length - 1 - i) % 2 === 0 ? d.date.getDate() : ""}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Daily revenue, last {data.length} days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Revenue</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date.toISOString()}>
              <td>{dayLabel(d.date)}</td>
              <td>{formatPrice(d.revenue)}</td>
              <td>{d.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
