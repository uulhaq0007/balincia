import Link from "next/link";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CouponForm } from "@/components/admin/CouponForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { FlagToggle } from "@/components/admin/FlagToggle";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pill } from "@/components/admin/StatusPill";
import { dateKey, readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteCoupon, saveCoupon, toggleCoupon } from "./actions";

export const metadata = { title: "Coupons" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function couponValue(coupon: { type: string; value: number }) {
  if (coupon.type === "PERCENT") return `${coupon.value}% off`;
  if (coupon.type === "FIXED") return `${formatPrice(coupon.value)} off`;
  return "Free shipping";
}

export default async function CouponsPage({ searchParams }: Props) {
  const editId = readParam(await searchParams, "edit");
  const coupons = await db.coupon.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] });
  const editing = editId ? coupons.find((c) => c.id === editId) : undefined;
  const now = new Date();

  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Coupons" description="Discount codes customers can apply at checkout." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card overflow-hidden lg:self-start">
          {coupons.length === 0 ? (
            <EmptyState icon={Tag} title="No coupons yet">
              Create a code with the form to run your first promotion.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-3 py-3 font-semibold">Discount</th>
                    <th className="px-3 py-3 text-right font-semibold">Min. spend</th>
                    <th className="px-3 py-3 text-right font-semibold">Used</th>
                    <th className="px-3 py-3 font-semibold">Expires</th>
                    <th className="px-3 py-3 font-semibold">Active</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-t border-line">
                  {coupons.map((coupon) => {
                    const expired = coupon.expiresAt != null && coupon.expiresAt < now;
                    const exhausted = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
                    return (
                      <tr key={coupon.id} className={cn("transition hover:bg-paper/60", coupon.id === editId && "bg-gold-soft/30")}>
                        <td className="max-w-[240px] px-5 py-3">
                          <span className="font-mono font-semibold tracking-wider text-ink">{coupon.code}</span>
                          {coupon.description && <span className="block truncate text-xs text-muted">{coupon.description}</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{couponValue(coupon)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink-soft">
                          {coupon.minSubtotal ? formatPrice(coupon.minSubtotal) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                          <span className={exhausted ? "font-semibold text-sale" : "text-ink-soft"}>
                            {coupon.usedCount.toLocaleString()} / {coupon.maxUses?.toLocaleString() ?? "∞"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {coupon.expiresAt ? (
                            expired ? (
                              <Pill tone="rose">Expired {formatDate(coupon.expiresAt)}</Pill>
                            ) : (
                              <span className="text-ink-soft">{formatDate(coupon.expiresAt)}</span>
                            )
                          ) : (
                            <span className="text-muted">Never</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <FlagToggle
                            action={toggleCoupon.bind(null, coupon.id)}
                            checked={coupon.isActive}
                            label={`${coupon.code} active`}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/coupons?edit=${coupon.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
                              aria-label={`Edit ${coupon.code}`}
                            >
                              <Pencil size={15} />
                            </Link>
                            <ConfirmButton
                              action={deleteCoupon.bind(null, coupon.id)}
                              title={`Delete ${coupon.code}?`}
                              description="Customers will no longer be able to use this code. Past orders keep their discount."
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-rose-50 hover:text-sale"
                              aria-label={`Delete ${coupon.code}`}
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="card p-5 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 font-display text-lg text-ink">{editing ? `Edit ${editing.code}` : "New coupon"}</h2>
          <CouponForm
            key={editing?.id ?? "new"}
            action={saveCoupon.bind(null, editing?.id ?? null)}
            coupon={
              editing && {
                code: editing.code,
                description: editing.description,
                type: editing.type,
                value: editing.value,
                minSubtotal: editing.minSubtotal,
                maxUses: editing.maxUses,
                expiresAt: editing.expiresAt ? dateKey(editing.expiresAt) : "",
                isActive: editing.isActive,
              }
            }
          />
        </section>
      </div>
    </div>
  );
}
