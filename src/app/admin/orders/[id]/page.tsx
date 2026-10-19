import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift } from "lucide-react";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PrintButton } from "@/components/admin/PrintButton";
import { OrderStatusPill, PaymentStatusPill } from "@/components/admin/StatusPill";
import { ProductImage } from "@/components/product/ProductImage";
import { DOT_TONES } from "@/lib/admin";
import { ORDER_STATUS_META, PAYMENT_METHODS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { cn, titleCase } from "@/lib/utils";
import { updateOrder } from "../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { number: true } });
  return { title: order ? `Order ${order.number}` : "Order" };
}

function Row({ label, value, strong, muted }: { label: React.ReactNode; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4 py-1", strong && "pt-3 text-base font-semibold text-ink", muted && "text-muted")}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, name: true, email: true, loyaltyPoints: true } },
    },
  });
  if (!order) notFound();

  const settings = await getSettings();
  const contactLine = [settings.contactPhone, settings.contactEmail].filter(Boolean).join(" · ");
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const payment = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod);

  return (
    <div>
      {/* Invoice letterhead, print only */}
      <div className="mb-8 hidden items-start justify-between border-b border-ink pb-6 print:flex">
        <div>
          <p className="font-display text-2xl tracking-[0.28em]">BALINCIA</p>
          <p className="mt-1 text-xs text-ink-soft">{settings.storeAddress}</p>
          <p className="text-xs text-ink-soft">
            {contactLine}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl">Invoice</p>
          <p className="text-sm">{order.number}</p>
          <p className="text-xs text-ink-soft">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="print:hidden">
        <PageHeader
          back={{ href: "/admin/orders", label: "Orders" }}
          eyebrow="Order"
          title={order.number}
          description={
            <span className="flex flex-wrap items-center gap-2">
              Placed {formatDateTime(order.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"}
              <OrderStatusPill status={order.status} />
              <PaymentStatusPill status={order.paymentStatus} />
            </span>
          }
        >
          <PrintButton />
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 print:block">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Items" flush className="print:border-0">
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-paper-2 print:hidden">
                    <ProductImage product={item} />
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="font-semibold text-ink hover:text-gold">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink">{item.name}</span>
                    )}
                    <p className="text-xs text-muted">
                      {item.variantLabel} · {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="border-t border-line px-5 py-4 text-sm text-ink-soft">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && (
                <Row
                  label={
                    <>
                      Discount
                      {order.couponCode && (
                        <span className="ml-2 rounded bg-gold-soft px-1.5 py-0.5 text-[0.7rem] font-semibold text-ink-2">
                          {order.couponCode}
                        </span>
                      )}
                    </>
                  }
                  value={`− ${formatPrice(order.discount)}`}
                />
              )}
              {order.discount === 0 && order.couponCode && <Row label={`Coupon ${order.couponCode}`} value="applied" muted />}
              {order.pointsRedeemed > 0 && (
                <Row
                  label={`Points redeemed (${order.pointsRedeemed.toLocaleString()})`}
                  value={`− ${formatPrice(order.pointsRedeemed)}`}
                />
              )}
              <Row
                label={`Shipping · ${titleCase(order.shippingMethod)}`}
                value={order.shippingFee ? formatPrice(order.shippingFee) : "Free"}
              />
              <Row label="Total" value={formatPrice(order.total)} strong />
            </dl>
          </Panel>

          <Panel title="Timeline" description="Status changes and internal notes" className="print:hidden">
            {order.events.length === 0 ? (
              <p className="text-sm text-muted">No events yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-line pl-6">
                {order.events.map((event) => {
                  const meta = ORDER_STATUS_META[event.status];
                  return (
                    <li key={event.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[1.94rem] top-1 h-3 w-3 rounded-full ring-4 ring-[#fffdf9]",
                          DOT_TONES[meta?.tone ?? "stone"],
                        )}
                      />
                      <p className="text-sm font-semibold text-ink">{meta?.label ?? titleCase(event.status)}</p>
                      {event.note && <p className="mt-0.5 text-sm text-ink-soft">{event.note}</p>}
                      <p className="mt-0.5 text-xs text-muted">{formatDateTime(event.createdAt)}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6 print:mt-6 print:grid print:grid-cols-2 print:gap-6 print:space-y-0">
          <Panel title="Update order" className="print:hidden">
            <OrderUpdateForm
              action={updateOrder.bind(null, order.id)}
              order={order}
              version={order.updatedAt.toISOString()}
            />
          </Panel>

          <Panel title="Customer">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-ink">{order.fullName}</p>
              <p>
                <a href={`mailto:${order.email}`} className="text-ink-soft hover:text-gold">
                  {order.email}
                </a>
              </p>
              <p>
                <a href={`tel:${order.phone}`} className="text-ink-soft hover:text-gold">
                  {order.phone}
                </a>
              </p>
              {order.user ? (
                <p className="pt-2 text-xs text-muted print:hidden">
                  Account:{" "}
                  <Link href={`/admin/customers/${order.user.id}`} className="font-semibold text-gold hover:text-ink">
                    {order.user.name}
                  </Link>{" "}
                  · {order.user.loyaltyPoints.toLocaleString()} points
                </p>
              ) : (
                <p className="pt-2 text-xs text-muted print:hidden">Guest checkout</p>
              )}
            </div>
          </Panel>

          <Panel title="Shipping address">
            <address className="space-y-0.5 text-sm not-italic text-ink-soft">
              <p className="font-semibold text-ink">{order.fullName}</p>
              <p>{order.line1}</p>
              {order.line2 && <p>{order.line2}</p>}
              <p>
                {order.city}, {order.province}
                {order.postalCode ? ` ${order.postalCode}` : ""}
              </p>
              <p>{order.phone}</p>
            </address>
            {(order.courier || order.trackingNumber) && (
              <p className="mt-3 border-t border-line pt-3 text-xs text-muted">
                {order.courier ?? "Courier"} · <span className="font-semibold text-ink">{order.trackingNumber ?? "no tracking yet"}</span>
              </p>
            )}
          </Panel>

          <Panel title="Payment">
            <div className="space-y-1 text-sm text-ink-soft">
              <p className="font-semibold text-ink">{payment?.label ?? order.paymentMethod}</p>
              <p className="flex items-center gap-2">
                Status <PaymentStatusPill status={order.paymentStatus} />
              </p>
            </div>
          </Panel>

          {(order.isGift || order.notes) && (
            <Panel title="Notes">
              <div className="space-y-4 text-sm">
                {order.isGift && (
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                      <Gift size={14} /> Gift order
                    </p>
                    <p className="whitespace-pre-line font-display text-base italic text-ink">
                      {order.giftMessage ? `“${order.giftMessage}”` : "No message — wrap as a gift."}
                    </p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Customer note</p>
                    <p className="whitespace-pre-line text-ink-soft">{order.notes}</p>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <p className="mt-10 hidden text-center text-xs text-ink-soft print:block">
        Thank you for shopping with Balincia{contactLine && ` · ${contactLine}`}
      </p>
    </div>
  );
}
