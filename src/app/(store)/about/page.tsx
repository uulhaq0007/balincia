import type { Metadata } from "next";
import Link from "next/link";
import { BottleArt } from "@/components/product/BottleArt";

export const metadata: Metadata = { title: "Our story", description: "How Balincia began — and why we believe scent is the story you leave behind." };

const VALUES = [
  { title: "Rare oils, honestly sourced", body: "Saffron from Kashmir, oud from responsible Cambodian plantations, rose from Taif. We pay for the real thing — and you can smell the difference." },
  { title: "Patience in every bottle", body: "Each batch is macerated for 30 days in our Karachi atelier before it's filtered, bottled and sealed by hand." },
  { title: "Luxury without the markup", body: "By making everything ourselves and selling directly, we offer niche-quality perfume at a fraction of designer prices." },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Our story</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] text-balance md:text-7xl">
            Born in Karachi, <em className="text-gold">bottled with patience.</em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            Balincia began in a small atelier with a simple belief: that the most meaningful moments of our lives — a wedding night, a
            monsoon afternoon, a grandmother&apos;s embrace — deserve a scent of their own.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-oud">
          <div className="grain absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(201,162,122,0.4),transparent)]" />
          <BottleArt palette={["#3b1d12", "#d08a4a"]} shape="classic" name="Saffron Dusk" bare className="animate-float absolute inset-x-[15%] bottom-6 h-[80%] w-[70%]" />
        </div>
      </section>

      <section className="bg-paper-2 py-16 md:py-24">
        <div className="container-x mx-auto max-w-3xl text-center">
          <p className="font-display text-3xl leading-snug text-balance md:text-4xl">
            “We don&apos;t make perfume to be noticed. We make perfume to be <em className="text-gold">remembered</em>.”
          </p>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-muted uppercase">— The Balincia atelier</p>
        </div>
      </section>

      <section className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <div key={v.title}>
              <span className="font-display text-5xl text-gold/60">0{i + 1}</span>
              <h2 className="mt-4 font-display text-2xl">{v.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x">
        <div className="rounded-[2rem] bg-ink px-6 py-16 text-center text-paper md:py-20">
          <h2 className="font-display text-4xl md:text-5xl">Find the scent that tells your story</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/quiz" className="btn btn-light">Take the quiz</Link>
            <Link href="/shop" className="btn border border-paper/30 text-paper hover:bg-paper/10">Shop the library</Link>
          </div>
        </div>
      </section>
    </>
  );
}
