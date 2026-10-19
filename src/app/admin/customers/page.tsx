import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { SearchForm } from "@/components/admin/SearchForm";
import { Pill } from "@/components/admin/StatusPill";
import { ADMIN_PAGE_SIZE, buildQuery, pageCount, readPage, readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Customers" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CustomersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = readParam(sp, "q");
  const roleParam = readParam(sp, "role");
  const role = roleParam === "ADMIN" || roleParam === "CUSTOMER" ? roleParam : undefined;
  const page = readPage(sp);

  const search: Prisma.UserWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
    : {};
  const where: Prisma.UserWhereInput = role ? { AND: [search, { role }] } : search;

  const [grouped, total, users] = await Promise.all([
    db.user.groupBy({ by: ["role"], where: search, _count: { _all: true } }),
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        loyaltyPoints: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  const spend = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) }, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const spendByUser = new Map(spend.map((s) => [s.userId, s._sum.total ?? 0]));
  const roleCount = (r: string) => grouped.find((g) => g.role === r)?._count._all ?? 0;

  const tabs = [
    { label: "All", href: `/admin/customers${buildQuery({ q })}`, active: !role, count: roleCount("CUSTOMER") + roleCount("ADMIN") },
    { label: "Customers", href: `/admin/customers${buildQuery({ q, role: "CUSTOMER" })}`, active: role === "CUSTOMER", count: roleCount("CUSTOMER") },
    { label: "Admins", href: `/admin/customers${buildQuery({ q, role: "ADMIN" })}`, active: role === "ADMIN", count: roleCount("ADMIN") },
  ];

  return (
    <div>
      <PageHeader eyebrow="People" title="Customers" description="Registered accounts, their orders and Balincia Points." />

      <FilterTabs tabs={tabs} label="Role" />

      <div className="card overflow-hidden">
        <div className="border-b border-line p-4">
          <SearchForm action="/admin/customers" defaultValue={q} hidden={{ role }} placeholder="Search by name, email or phone" />
        </div>

        {users.length === 0 ? (
          <EmptyState icon={Users} title="No customers found">
            {q ? "Try a different search." : "Accounts appear here when shoppers register."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Phone</th>
                  <th className="px-3 py-3 text-right font-semibold">Orders</th>
                  <th className="px-3 py-3 text-right font-semibold">Lifetime spend</th>
                  <th className="px-3 py-3 text-right font-semibold">Points</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-paper/60">
                    <td className="max-w-[300px] px-5 py-3">
                      <Link href={`/admin/customers/${user.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-2 font-display text-sm text-ink">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold text-ink hover:text-gold">{user.name}</span>
                            {user.role === "ADMIN" && <Pill tone="gold">Admin</Pill>}
                          </span>
                          <span className="block truncate text-xs text-muted">{user.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{user.phone ?? "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{user._count.orders}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatPrice(spendByUser.get(user.id) ?? 0)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{user.loyaltyPoints.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink-soft">{formatDate(user.createdAt)}</td>
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
        basePath="/admin/customers"
        params={{ q, role }}
        noun={total === 1 ? "account" : "accounts"}
      />
    </div>
  );
}
