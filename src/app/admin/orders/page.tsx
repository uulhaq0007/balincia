import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { SearchForm } from "@/components/admin/SearchForm";
import { OrderStatusPill, PaymentStatusPill } from "@/components/admin/StatusPill";
import { ADMIN_PAGE_SIZE, buildQuery, pageCount, readPage, readParam } from "@/lib/admin";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { titleCase } from "@/lib/utils";

export const metadata = { title: "Orders" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const PAYMENT_LABEL: Record<string, string> = { COD: "COD", BANK: "Bank", WALLET: "Wallet" };

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = readParam(sp, "q");
  const statusParam = readParam(sp, "status");
  const status = ORDER_STATUSES.find((s) => s === statusParam);
  const page = readPage(sp);

  const search: Prisma.OrderWhereInput = q
    ? {
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      }
    : {};
  const where: Prisma.OrderWhereInput = status ? { AND: [search, { status }] } : search;

  const [grouped, total, orders] = await Promise.all([
    db.order.groupBy({ by: ["status"], where: search, _count: { _all: true } }),
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        number: true,
        createdAt: true,
        fullName: true,
        email: true,
        city: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        items: { select: { quantity: true } },
      },
    }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
  const allCount = grouped.reduce((sum, g) => sum + g._count._all, 0);
  const tabs = [
    { label: "All", href: `/admin/orders${buildQuery({ q })}`, active: !status, count: allCount },
    ...ORDER_STATUSES.map((s) => ({
      label: titleCase(s),
      href: `/admin/orders${buildQuery({ q, status: s })}`,
      active: status === s,
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div>
      <PageHeader eyebrow="Sales" title="Orders" description="Every order placed on the store, newest first." />

      <FilterTabs tabs={tabs} label="Order status" />

      <div className="card overflow-hidden">
        <div className="border-b border-line p-4">
          <SearchForm
            action="/admin/orders"
            defaultValue={q}
            hidden={{ status }}
            placeholder="Search by order number, email, name or phone"
          />
        </div>

        {orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found">
            {q ? "Try a different search or clear the filters." : "Orders will appear here as soon as customers check out."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">City</th>
                  <th className="px-3 py-3 text-right font-semibold">Items</th>
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-paper/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-ink hover:text-gold">
                        {order.number}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{formatDate(order.createdAt)}</td>
                    <td className="max-w-[220px] px-3 py-3">
                      <span className="block truncate text-ink">{order.fullName}</span>
                      <span className="block truncate text-xs text-muted">{order.email}</span>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{order.city}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatPrice(order.total)}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold text-ink-soft"
                          title={PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label}
                        >
                          {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                        <PaymentStatusPill status={order.paymentStatus} />
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <OrderStatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pages={pageCount(total)}
        total={total}
        basePath="/admin/orders"
        params={{ q, status }}
        noun={total === 1 ? "order" : "orders"}
      />
    </div>
  );
}
