import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/order/StatusBadge";
import { ProductImage } from "@/components/product/ProductImage";

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h2 className="font-display text-3xl">Order history</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="text-ink-soft">No orders yet — your first bottle is waiting.</p>
          <Link href="/shop" className="btn btn-primary btn-sm mt-4">Browse the library</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-2/50 px-5 py-4 text-sm">
                <div className="flex flex-wrap gap-x-8 gap-y-1">
                  <span>
                    <span className="text-muted">Order </span>
                    <strong>{o.number}</strong>
                  </span>
                  <span className="text-muted">{formatDate(o.createdAt)}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 4).map((i) => (
                    <div key={i.id} className="h-16 w-13 overflow-hidden rounded-lg border-2 border-paper bg-paper-2">
                      <ProductImage product={i} />
                    </div>
                  ))}
                  {o.items.length > 4 && (
                    <div className="grid h-16 w-13 place-items-center rounded-lg border-2 border-paper bg-paper-3 text-xs font-bold">
                      +{o.items.length - 4}
                    </div>
                  )}
                </div>
                <Link href={`/account/orders/${o.number}`} className="btn btn-outline btn-sm">
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
