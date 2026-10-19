import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { ReturnForm } from "@/components/forms/ReturnForm";

export const metadata: Metadata = { title: "Returns & exchanges" };

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="15-day promise"
        title="Returns & exchanges"
        description="Changed your mind? Exchange or return unused, sealed products within 15 days of delivery."
      />
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <ol className="space-y-6">
          {[
            ["Submit the form", "Tell us your order number, the reason and whether you'd like an exchange, refund or store credit."],
            ["We arrange pickup", "Our courier partner collects the parcel from your door within 2–3 working days. No charge for defective items."],
            ["Inspection", "Once received, our team checks the item is unused with the seal intact."],
            ["Resolution", "Exchanges ship immediately; refunds are processed to your bank or wallet within 5–7 working days."],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{i + 1}</span>
              <div>
                <p className="font-display text-xl">{title}</p>
                <p className="mt-1 text-sm text-ink-soft">{body}</p>
              </div>
            </li>
          ))}
          <li className="text-sm text-ink-soft">
            Read the full <Link href="/policies/returns" className="underline underline-offset-4">return policy</Link>.
          </li>
        </ol>
        <ReturnForm defaultOrder={order} />
      </div>
    </>
  );
}
