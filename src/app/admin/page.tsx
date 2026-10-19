import Link from "next/link";
import { CircleCheck, Clock, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";
import { Kpi } from "@/components/admin/Kpi";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderStatusPill } from "@/components/admin/StatusPill";
import { EmptyState } from "@/components/admin/EmptyState";
import { ProductImage } from "@/components/product/ProductImage";
import { dateKey, daysAgo } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

const DAY = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

function percentChange(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

export default async function AdminDashboard() {
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);
  const since60 = new Date(now - 60 * DAY);
  const chartStart = daysAgo(CHART_DAYS - 1);
  const live = { status: { not: "CANCELLED" } };

  const [last30, prev30, cancelled30, customers, newCustomers, pending, chartOrders, recent, topProducts, lowStock, lowStockTotal] =
    await Promise.all([
      db.order.aggregate({ where: { ...live, createdAt: { gte: since30 } }, _sum: { total: true }, _count: { _all: true } }),
      db.order.aggregate({
        where: { ...live, createdAt: { gte: since60, lt: since30 } },
        _sum: { total: true },
        _count: { _all: true },
      }),
      db.order.count({ where: { status: "CANCELLED", createdAt: { gte: since30 } } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.findMany({ where: { ...live, createdAt: { gte: chartStart } }, select: { createdAt: true, total: true } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, number: true, fullName: true, city: true, total: true, status: true, createdAt: true },
      }),
      db.product.findMany({
        orderBy: { soldCount: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          images: true,
          palette: true,
          bottleShape: true,
          soldCount: true,
          price: true,
          category: { select: { name: true } },
        },
      }),
      db.variant.findMany({
        where: { stock: { lte: 5 }, product: { isActive: true } },
        orderBy: [{ stock: "asc" }, { product: { soldCount: "desc" } }],
        take: 8,
        select: { id: true, label: true, sku: true, stock: true, product: { select: { id: true, name: true } } },
      }),
      db.variant.count({ where: { stock: { lte: 5 }, product: { isActive: true } } }),
    ]);

  const revenue = last30._sum.total ?? 0;
  const orders = last30._count._all;
  const avgOrder = orders ? Math.round(revenue / orders) : 0;
  const prevRevenue = prev30._sum.total ?? 0;
  const prevOrders = prev30._count._all;
  const prevAvg = prevOrders ? prevRevenue / prevOrders : 0;

  const buckets = new Map<string, { date: Date; revenue: number; orders: number }>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const date = new Date(chartStart);
    date.setDate(chartStart.getDate() + i);
    buckets.set(dateKey(date), { date, revenue: 0, orders: 0 });
  }
  for (const order of chartOrders) {
    const bucket = buckets.get(dateKey(order.createdAt));
    if (bucket) {
      bucket.revenue += order.total;
      bucket.orders += 1;
    }
  }
  const series = [...buckets.values()];
  const chartTotal = series.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={`Here's how Balincia is doing — ${formatDate(new Date())}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi
          label="Revenue · 30d"
          value={formatPrice(revenue)}
          icon={Wallet}
          delta={percentChange(revenue, prevRevenue)}
          hint="vs previous 30 days"
        />
        <Kpi
          label="Orders · 30d"
          value={orders.toLocaleString()}
          icon={ShoppingBag}
          delta={percentChange(orders, prevOrders)}
          hint={cancelled30 ? `${cancelled30} cancelled excluded` : "vs previous 30 days"}
        />
        <Kpi
          label="Avg. order value"
          value={formatPrice(avgOrder)}
          icon={TrendingUp}
          delta={percentChange(avgOrder, prevAvg)}
          hint="last 30 days"
        />
        <Kpi
          label="Customers"
          value={customers.toLocaleString()}
          icon={Users}
          hint={newCustomers ? `+${newCustomers} joined in 30 days` : "registered accounts"}
        />
        <Kpi
          label="Pending orders"
          value={pending.toLocaleString()}
          icon={Clock}
          hint={
            pending ? (
              <Link href="/admin/orders?status=PENDING" className="font-semibold text-gold hover:text-ink">
                Review now →
              </Link>
            ) : (
              "all caught up"
            )
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Revenue · last 14 days"
          description="Daily order totals, cancelled orders excluded"
          className="xl:col-span-2"
          aside={<p className="font-display text-xl tabular-nums text-ink">{formatPrice(chartTotal)}</p>}
        >
          <RevenueChart data={series} />
        </Panel>

        <Panel title="Top sellers" description="By units sold, all time" action={{ href: "/admin/products", label: "Products" }} flush>
          <ul className="divide-y divide-line">
            {topProducts.map((product, i) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-paper/60">
                  <span className="w-4 text-xs font-semibold text-muted tabular-nums">{i + 1}</span>
                  <span className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-paper-2">
                    <ProductImage product={product} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                    <span className="block truncate text-xs text-muted">{product.category.name}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold tabular-nums">{product.soldCount.toLocaleString()}</span>
                    <span className="block text-[0.65rem] uppercase tracking-wider text-muted">sold</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Recent orders" action={{ href: "/admin/orders", label: "All orders" }} className="xl:col-span-2" flush>
          {recent.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-3 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-5 py-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-t border-line">
                  {recent.map((order) => (
                    <tr key={order.id} className="transition hover:bg-paper/60">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-semibold text-ink hover:text-gold">
                          {order.number}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="block text-ink">{order.fullName}</span>
                        <span className="block text-xs text-muted">{order.city}</span>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{formatDate(order.createdAt)}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatPrice(order.total)}</td>
                      <td className="px-5 py-3 text-right">
                        <OrderStatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Low stock"
          description={lowStockTotal ? `${lowStockTotal} variants at 5 units or fewer` : "Variants at 5 units or fewer"}
          flush
        >
          {lowStock.length === 0 ? (
            <EmptyState icon={CircleCheck} title="Stock looks healthy" />
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((variant) => (
                <li key={variant.id}>
                  <Link
                    href={`/admin/products/${variant.product.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition hover:bg-paper/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{variant.product.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {variant.label} · {variant.sku}
                      </span>
                    </span>
                    <span
                      className={
                        variant.stock === 0
                          ? "rounded-full bg-rose-100 px-2.5 py-0.5 text-[0.7rem] font-semibold text-rose-800"
                          : "rounded-full bg-amber-100 px-2.5 py-0.5 text-[0.7rem] font-semibold text-amber-800 tabular-nums"
                      }
                    >
                      {variant.stock === 0 ? "Sold out" : `${variant.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
