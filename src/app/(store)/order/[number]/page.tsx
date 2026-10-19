import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CircleCheck, Landmark, Smartphone } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/contact";
import { LAST_ORDER_COOKIE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { OrderDetails } from "@/components/order/OrderDetails";
import { OrderTimeline } from "@/components/order/OrderTimeline";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const [order, session, jar, settings] = await Promise.all([
    db.order.findUnique({
      where: { number: number.toUpperCase() },
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    }),
    getSession(),
    cookies(),
    getSettings(),
  ]);
  if (!order) notFound();

  const canView =
    jar.get(LAST_ORDER_COOKIE)?.value === order.number ||
    (session && (session.sub === order.userId || session.role === "ADMIN"));

  if (!canView) {
    return (
      <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-4xl">Order {order.number}</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          For your privacy, order details are only visible to the customer who placed it. Track it with your email or phone number instead.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href={`/track?number=${order.number}`} className="btn btn-primary">Track order</Link>
          <Link href={`/login?next=/order/${order.number}`} className="btn btn-outline">Sign in</Link>
        </div>
      </div>
    );
  }

  const receiptLink = whatsappHref(settings.whatsappNumber, `Hi Balincia! Here is my payment receipt for order ${order.number}.`);

  return (
    <div className="container-x py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/10 text-sage">
            <CircleCheck size={34} strokeWidth={1.5} />
          </span>
          <p className="eyebrow mt-6">Order {order.number}</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">
            Thank you, {order.fullName.split(" ")[0]}.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">
            Your order is confirmed and our atelier is getting it ready. Keep your order number handy — you can{" "}
            <Link href={`/track?number=${order.number}`} className="underline underline-offset-4">track it anytime</Link> with {order.email}.
          </p>
        </div>

        {(order.paymentMethod === "BANK" || order.paymentMethod === "WALLET") && order.paymentStatus !== "PAID" && (
          <div className="mt-10 rounded-3xl border border-gold/40 bg-gold-soft/40 p-6 md:p-8">
            <div className="flex items-center gap-3">
              {order.paymentMethod === "BANK" ? <Landmark className="text-gold" /> : <Smartphone className="text-gold" />}
              <p className="font-display text-2xl">Complete your payment</p>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Please transfer <strong className="text-ink">{formatPrice(order.total)}</strong> using the details below and include your order
              number <strong className="text-ink">{order.number}</strong> as the reference. Send the receipt to us
              {receiptLink ? (
                <>
                  {" "}
                  <a href={receiptLink} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-4">
                    on WhatsApp
                  </a>
                </>
              ) : (
                " on WhatsApp"
              )}{" "}
              — we&apos;ll dispatch as soon as it&apos;s verified.
            </p>
            <pre className="mt-4 rounded-xl bg-paper p-4 font-sans text-sm whitespace-pre-wrap">
              {order.paymentMethod === "BANK" ? settings.bankDetails : settings.walletDetails}
            </pre>
          </div>
        )}

        <div className="card mt-10 p-6 md:p-8">
          <OrderTimeline status={order.status} events={order.events} courier={order.courier} trackingNumber={order.trackingNumber} />
        </div>

        <div className="mt-10">
          <OrderDetails order={order} />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
          {session ? (
            <Link href={`/account/orders/${order.number}`} className="btn btn-outline">View in my account</Link>
          ) : (
            <Link href="/register" className="btn btn-outline">Create an account to earn points</Link>
          )}
        </div>
      </div>
    </div>
  );
}
