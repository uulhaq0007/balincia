import Link from "next/link";
import { Stars } from "@/components/ui/Stars";
import { SectionHeading } from "./SectionHeading";

type Review = { id: string; name: string; rating: number; title: string; body: string; product: { name: string; slug: string } };

export function Testimonials({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <section className="overflow-hidden py-16 md:py-20">
      <div className="container-x">
        <SectionHeading eyebrow="In your words" title={<>Worn, loved, <em className="text-gold">reviewed</em></>} />
      </div>
      <div className="no-scrollbar container-x flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto pb-2 md:scroll-px-8 xl:scroll-px-12">
        {reviews.map((r) => (
          <figure key={r.id} className="card flex w-[85%] shrink-0 snap-start flex-col p-7 sm:w-[46%] lg:w-[31%]">
            <Stars rating={r.rating} />
            <blockquote className="mt-4 flex-1">
              {r.title && <p className="font-display text-xl leading-snug">“{r.title}”</p>}
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="font-semibold">{r.name}</span>
              <Link href={`/products/${r.product.slug}`} className="text-xs text-gold hover:underline">
                on {r.product.name}
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
