import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoyaltyPointsForm } from "@/components/admin/LoyaltyPointsForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { OrderStatusPill, Pill } from "@/components/admin/StatusPill";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { loyaltyTier } from "@/lib/pricing";
import { adjustPoints, setRole } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user?.name ?? "Customer" };
}

export default async function CustomerDetailPage({ params }: Props) {
  const [{ id }, admin] = await Promise.all([params, requireAdmin()]);
  const user = await db.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          number: true,
          createdAt: true,
          total: true,
          status: true,
          paymentStatus: true,
          items: { select: { quantity: true } },
        },
      },
      _count: { select: { reviews: true } },
    },
  });
  if (!user) notFound();

  const liveOrders = user.orders.filter((o) => o.status !== "CANCELLED");
  const lifetimeSpend = liveOrders.reduce((sum, o) => sum + o.total, 0);
  const { tier } = loyaltyTier(lifetimeSpend);
  const isSelf = user.id === admin.id;
  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        eyebrow={isAdmin ? "Admin account" : "Customer"}
        title={user.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Joined {formatDate(user.createdAt)}
            <Pill tone="gold">{tier.name} tier</Pill>
            {isAdmin && <Pill tone="indigo">Admin</Pill>}
          </span>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lifetime spend", value: formatPrice(lifetimeSpend) },
          { label: "Orders", value: user.orders.length.toLocaleString() },
          { label: "Avg. order", value: formatPrice(liveOrders.length ? lifetimeSpend / liveOrders.length : 0) },
          { label: "Balincia Points", value: user.loyaltyPoints.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{stat.label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Orders" description={`${user._count.reviews} reviews written`} flush>
            {user.orders.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No orders yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-3 py-3 font-semibold">Date</th>
                      <th className="px-3 py-3 text-right font-semibold">Items</th>
                      <th className="px-3 py-3 text-right font-semibold">Total</th>
                      <th className="px-5 py-3 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line border-t border-line">
                    {user.orders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-paper/60">
                        <td className="px-5 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="font-semibold text-ink hover:text-gold">
                            {order.number}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{formatDate(order.createdAt)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
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

          <Panel title="Addresses" flush>
            {user.addresses.length === 0 ? (
              <EmptyState icon={MapPin} title="No saved addresses" />
            ) : (
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {user.addresses.map((address) => (
                  <li key={address.id} className="bg-[#fffdf9] px-5 py-4 text-sm text-ink-soft">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      {address.fullName}
                      {address.isDefault && <Pill tone="emerald">Default</Pill>}
                    </p>
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.province}
                      {address.postalCode ? ` ${address.postalCode}` : ""}
                    </p>
                    <p>{address.phone}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Profile">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd>
                  <a href={`mailto:${user.email}`} className="text-ink hover:text-gold">
                    {user.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="text-ink">{user.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Loyalty tier</dt>
                <dd className="text-ink">
                  {tier.name} <span className="text-muted">· {tier.perk}</span>
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Balincia Points" description={`Current balance: ${user.loyaltyPoints.toLocaleString()} points`}>
            <LoyaltyPointsForm action={adjustPoints.bind(null, user.id)} points={user.loyaltyPoints} />
          </Panel>

          <Panel title="Access">
            <p className="flex items-start gap-2 text-sm text-ink-soft">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold" />
              {isAdmin ? "This account can sign in to the admin panel." : "This is a regular customer account."}
            </p>
            {isSelf ? (
              <p className="mt-3 text-xs text-muted">This is your account — you can't change your own role.</p>
            ) : (
              <ConfirmButton
                action={setRole.bind(null, user.id, isAdmin ? "CUSTOMER" : "ADMIN")}
                title={isAdmin ? `Remove admin access for ${user.name}?` : `Make ${user.name} an admin?`}
                description={
                  isAdmin
                    ? "They will immediately lose access to the admin panel."
                    : "Admins can see every order and customer, change prices and edit store settings."
                }
                confirmLabel={isAdmin ? "Remove access" : "Make admin"}
                className="btn btn-outline btn-sm mt-4 w-full"
              >
                {isAdmin ? "Revoke admin access" : "Promote to admin"}
              </ConfirmButton>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
