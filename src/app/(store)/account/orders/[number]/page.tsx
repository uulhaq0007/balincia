import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { OrderDetails } from "@/components/order/OrderDetails";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { StatusBadge } from "@/components/order/StatusBadge";

export default async function AccountOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const user = await requireUser(`/account/orders/${number}`);
  const order = await db.order.findFirst({
    where: { number: number.toUpperCase(), userId: user.id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const deliveredAt = order.events.find((e) => e.status === "DELIVERED")?.createdAt;
  const canReturn = order.status === "DELIVERED" && deliveredAt && Date.now() - deliveredAt.getTime() < 15 * 86400000;

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ChevronLeft size={16} /> All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Order {order.number}</h2>
          <p className="text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} className="text-xs" />
      </div>

      <div className="card mt-6 p-6">
        <OrderTimeline status={order.status} events={order.events} courier={order.courier} trackingNumber={order.trackingNumber} />
      </div>

      <div className="mt-8">
        <OrderDetails order={order} />
      </div>

      {canReturn && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-paper-2 p-5">
          <p className="text-sm text-ink-soft">Not quite right? You can exchange or return within 15 days of delivery.</p>
          <Link href={`/returns?order=${order.number}`} className="btn btn-outline btn-sm">Request a return</Link>
        </div>
      )}
    </div>
  );
}
