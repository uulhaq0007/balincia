import { Droplets, Hourglass, RotateCcw, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";

export function TrustSection({ stats, freeShippingThreshold }: { stats: { value: string; label: string }[]; freeShippingThreshold: number }) {
  const PILLARS = [
    { Icon: Hourglass, title: "Macerated 30 days", body: "Every batch rests for a month so the oils marry fully — the secret to richer, smoother scent." },
    { Icon: Droplets, title: "Up to 12+ hours", body: "High concentrations of premium oils mean your fragrance lasts from morning meetings to late dinners." },
    { Icon: RotateCcw, title: "15-day exchanges", body: "Not in love? Exchange or return within 15 days. Our team handles it with zero fuss." },
    {
      Icon: Truck,
      title: "COD nationwide",
      body: `Cash on delivery across Pakistan${freeShippingThreshold > 0 ? `, free shipping over ${formatPrice(freeShippingThreshold)}` : ""}, and express delivery in 24–48 hrs.`,
    },
  ];
  return (
    <section className="container-x py-16 md:py-20">
      <div className="grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map(({ Icon, title, body }) => (
          <div key={title} className="bg-paper p-7 md:p-8">
            <Icon size={26} strokeWidth={1.4} className="text-gold" />
            <h3 className="mt-5 font-display text-xl">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
      <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-4xl text-ink md:text-5xl">{s.value}</dd>
            <dd className="mt-1 text-xs font-semibold tracking-[0.16em] text-muted uppercase">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
