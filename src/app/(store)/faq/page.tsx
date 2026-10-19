import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { getSettings, type StoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "FAQs" };

const faqs = (s: StoreSettings): { section: string; items: [string, string][] }[] => [
  {
    section: "Orders & delivery",
    items: [
      ["How long does delivery take?", "Standard delivery takes 2–4 working days nationwide. Express delivery (24–48 hours) is available in Karachi, Lahore, Islamabad and Rawalpindi."],
      ["Do you offer cash on delivery?", "Yes — COD is available across Pakistan. You can also pay by bank transfer or JazzCash / Easypaisa."],
      [
        "How much is shipping?",
        `Standard shipping is free on orders over ${formatPrice(s.freeShippingThreshold)}. Below that, a flat ${formatPrice(s.standardShippingFee)} applies. Express shipping is ${formatPrice(s.expressShippingFee)}.`,
      ],
      ["How do I track my order?", "Use our Track Order page with your order number and the email or phone you used at checkout. Signed-in customers can also see live status in My Account."],
    ],
  },
  {
    section: "Our fragrances",
    items: [
      ["How long do Balincia perfumes last?", "Our Eau de Parfums last 6–10 hours on most skin, and our Noir extraits and attars often last 12 hours or more. Longevity varies with skin type and climate."],
      ["What does 'super-macerated' mean?", "After blending, every batch rests for 30 days so the oils and alcohol fully marry. This creates a smoother, richer and longer-lasting scent."],
      ["Are your attars alcohol-free?", "Yes. All Balincia attars are concentrated perfume oils with no alcohol."],
      ["Not sure which scent to choose?", "Take our 60-second scent quiz, or try a Discovery Set — it includes a voucher towards your first full bottle."],
    ],
  },
  {
    section: "Returns & account",
    items: [
      ["What is your return policy?", "You can exchange or return unused, sealed products within 15 days of delivery. Damaged or incorrect items are always replaced free of charge."],
      [
        "How do loyalty points work?",
        `Members earn ${s.pointsPer100} point${s.pointsPer100 === 1 ? "" : "s"} for every Rs. 100 spent once an order is delivered. Points are worth Rs. 1 each and can cover up to ${s.maxPointsRedeemPercent}% of a future order.`,
      ],
      ["Do I need an account to order?", "No — guest checkout is available. Creating an account lets you earn points, save addresses and see your order history."],
    ],
  },
];

export default async function FaqPage() {
  const FAQS = faqs(await getSettings());
  return (
    <>
      <PageHero eyebrow="Help centre" title="Frequently asked questions" description="Everything you need to know about ordering, our fragrances and returns." />
      <div className="container-x mx-auto max-w-3xl space-y-12">
        {FAQS.map((group) => (
          <section key={group.section}>
            <h2 className="mb-4 font-display text-2xl">{group.section}</h2>
            <div className="divide-y divide-line rounded-2xl border border-line bg-white/50">
              {group.items.map(([q, a]) => (
                <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <p className="text-center text-ink-soft">
          Still have questions?{" "}
          <Link href="/contact" className="font-semibold text-ink underline underline-offset-4">
            Contact our team
          </Link>
        </p>
      </div>
    </>
  );
}
