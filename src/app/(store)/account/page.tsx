import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { LOYALTY_TIERS, loyaltyTier } from "@/lib/pricing";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/order/StatusBadge";

export default async function AccountOverviewPage() {
  const user = await requireUser();
  const [orders, spend, orderCount] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { items: true } } },
    }),
    db.order.aggregate({ where: { userId: user.id, status: "DELIVERED" }, _sum: { total: true } }),
    db.order.count({ where: { userId: user.id } }),
  ]);

  const lifetime = spend._sum.total ?? 0;
  const { tier, next } = loyaltyTier(lifetime);
  const progress = next ? Math.min(100, ((lifetime - tier.min) / (next.min - tier.min)) * 100) : 100;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-oud p-7 text-paper md:p-10">
        <div className="grain absolute inset-0" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow flex items-center gap-2 text-gold-2">
              <Sparkles size={14} /> Balincia Circle · {tier.name}
            </p>
            <p className="mt-4 font-display text-6xl leading-none tabular-nums">{user.loyaltyPoints.toLocaleString()}</p>
            <p className="mt-2 text-sm text-paper/70">points available · worth {formatPrice(user.loyaltyPoints)} at checkout</p>
          </div>
          <div className="min-w-64">
            <div className="flex justify-between text-xs text-paper/70">
              <span>{tier.name}</span>
              <span>{next ? next.name : "Top tier"}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper/15">
              <div className="h-full rounded-full bg-gold-2" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-paper/70">
              {next ? `Spend ${formatPrice(next.min - lifetime)} more to reach ${next.name}` : "You've reached our highest tier — thank you."}
            </p>
          </div>
        </div>
        <ul className="relative mt-8 grid gap-3 border-t border-paper/10 pt-6 text-xs text-paper/70 sm:grid-cols-3">
          {LOYALTY_TIERS.map((t) => (
            <li key={t.name} className={t.name === tier.name ? "text-paper" : ""}>
              <span className="font-bold tracking-widest uppercase">{t.name}</span>
              <span className="block">{t.perk}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Recent orders</h2>
          {orderCount > 3 && (
            <Link href="/account/orders" className="flex items-center gap-1 text-sm font-semibold">
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-ink-soft">You haven&apos;t placed any orders yet.</p>
            <Link href="/collections/best-sellers" className="btn btn-primary btn-sm mt-4">Start shopping</Link>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white/50">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.number}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-paper-2/60">
                  <div>
                    <p className="font-semibold">{o.number}</p>
                    <p className="text-xs text-muted">
                      {formatDate(o.createdAt)} · {o._count.items} {o._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Track an order", href: "/track", body: "See live status and courier tracking." },
          { title: "Start a return", href: "/returns", body: "Exchanges & returns within 15 days." },
          { title: "Need help?", href: "/contact", body: "Our fragrance team replies within hours." },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card group p-5 transition-colors hover:border-ink-soft">
            <p className="font-display text-xl">{c.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.body}</p>
            <ArrowRight size={16} className="mt-3 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>
    </div>
  );
}
