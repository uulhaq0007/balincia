import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/lib/markdown";
import { getSettings, type StoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { PageHero } from "@/components/layout/PageHero";

const POLICIES: Record<string, { title: string; body: (s: StoreSettings) => string }> = {
  shipping: {
    title: "Shipping policy",
    body: (s) => `We deliver to every city in Pakistan through our courier partners (TCS, Leopards and M&P).

## Delivery times
- **Standard:** 2–4 working days for major cities, 4–6 working days for remote areas.
- **Express:** 24–48 hours in Karachi, Lahore, Islamabad and Rawalpindi.

Orders placed before 2pm (Mon–Sat) are dispatched the same day.

## Shipping charges
- **Standard:** free on orders of ${formatPrice(s.freeShippingThreshold)} or more; otherwise a flat ${formatPrice(s.standardShippingFee)}.
- **Express:** ${formatPrice(s.expressShippingFee)} per order.

## Cash on delivery
COD is available nationwide. Please keep the exact amount ready — our riders may not carry change.

## Tracking
Once your order ships you can follow it on our [Track Order](/track) page using your order number.`,
  },
  returns: {
    title: "Return & refund policy",
    body: () => `We want you to love your Balincia fragrance. If something isn't right, we're here to help.

## 15-day returns & exchanges
You can request an exchange, refund or store credit within **15 days of delivery** for products that are unused, with the seal and original packaging intact.

## Damaged or incorrect items
If your item arrives damaged, leaking or incorrect, contact us within 48 hours with a photo. We'll replace it free of charge — including return shipping.

## Non-returnable items
- Opened or used perfumes, attars and body mists
- Discovery and sample sets
- Products bought on final clearance

## Refunds
Approved refunds are processed within 5–7 working days to your bank account or mobile wallet. COD orders are refunded by bank transfer.

## How to start a return
Fill in our [return form](/returns) and our team will arrange a pickup.`,
  },
  privacy: {
    title: "Privacy policy",
    body: (s) => `Balincia (Pvt) Ltd respects your privacy. This policy explains what we collect and why.

## What we collect
- Contact and delivery details you provide at checkout (name, email, phone, address)
- Account details if you create an account (password is stored securely hashed)
- Order history and loyalty points
- Messages you send us through our contact or return forms

## How we use it
We use your information to process and deliver orders, provide customer support, run the loyalty programme and — only if you subscribe — send you news and offers.

## Sharing
We share delivery details with our courier partners solely to deliver your order. We never sell your personal data.

## Your choices
You can update your details in My Account, unsubscribe from emails at any time, or ask us to delete your data by emailing ${s.contactEmail || "us"}.`,
  },
  terms: {
    title: "Terms of service",
    body: (s) => `By using balincia.pk and placing an order you agree to these terms.

## Products & pricing
All prices are in Pakistani Rupees and include applicable taxes. We may update prices and availability at any time; the price shown at checkout is the price you pay.

## Orders
An order is confirmed once you receive an order number. We may cancel orders in case of stock errors, suspected fraud or incorrect pricing, and will refund any amount paid.

## Discount codes & loyalty points
Codes cannot be combined unless stated. Loyalty points have no cash value, are non-transferable and may be adjusted for cancelled or returned orders.

## Liability
Fragrances may affect individuals differently. Please patch-test if you have sensitive skin and discontinue use if irritation occurs.

## Contact
Questions? ${[s.contactEmail && `email ${s.contactEmail}`, s.contactPhone && `call ${s.contactPhone}`].filter(Boolean).join(" or ").replace(/^./, (c) => c.toUpperCase()) || "Contact us any time"}.`,
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = POLICIES[(await params).slug];
  return { title: policy?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: Props) {
  const policy = POLICIES[(await params).slug];
  if (!policy) notFound();
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow="Policies" title={policy.title} />
      <div className="container-x">
        <div className="prose-balincia mx-auto max-w-2xl">
          <Markdown source={policy.body(settings)} />
        </div>
      </div>
    </>
  );
}
