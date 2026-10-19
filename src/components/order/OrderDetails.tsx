import Link from "next/link";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";

type Order = {
  number: string;
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  subtotal: number;
  discount: number;
  pointsRedeemed: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  isGift: boolean;
  giftMessage: string | null;
  items: { id: string; name: string; variantLabel: string; slug: string; palette: string; bottleShape: string; image: string | null; price: number; quantity: number }[];
};

export function OrderDetails({ order }: { order: Order }) {
  const payment = PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label ?? order.paymentMethod;
  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="eyebrow mb-4">Items</p>
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <Link href={`/products/${item.slug}`} className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                <ProductImage product={item} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="font-display text-lg hover:text-gold">
                  {item.name}
                </Link>
                <p className="text-xs text-muted">
                  {item.variantLabel} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <Line label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && <Line label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${formatPrice(order.discount)}`} />}
          {order.pointsRedeemed > 0 && <Line label="Points redeemed" value={`− ${formatPrice(order.pointsRedeemed)}`} />}
          <Line label={`Shipping (${order.shippingMethod === "EXPRESS" ? "Express" : "Standard"})`} value={order.shippingFee ? formatPrice(order.shippingFee) : "Free"} />
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold">Total</dt>
            <dd className="font-display text-2xl tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-6 text-sm">
        <div>
          <p className="eyebrow mb-2">Delivering to</p>
          <p className="font-semibold">{order.fullName}</p>
          <p className="text-ink-soft">{order.line1}</p>
          {order.line2 && <p className="text-ink-soft">{order.line2}</p>}
          <p className="text-ink-soft">
            {order.city}, {order.province} {order.postalCode}
          </p>
          <p className="mt-1 text-ink-soft">{order.phone}</p>
          <p className="text-ink-soft">{order.email}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Payment</p>
          <p className="font-semibold">{payment}</p>
          <p className="text-ink-soft">{order.paymentStatus === "PAID" ? "Paid" : order.paymentStatus === "REFUNDED" ? "Refunded" : "Awaiting payment"}</p>
        </div>
        {order.isGift && (
          <div>
            <p className="eyebrow mb-2">Gift note</p>
            <p className="font-display text-lg text-ink-soft italic">“{order.giftMessage || "Gift-wrapped with love"}”</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
