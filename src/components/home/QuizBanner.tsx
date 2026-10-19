import Link from "next/link";
import { BottleArt } from "@/components/product/BottleArt";

export function QuizBanner() {
  return (
    <section className="container-x py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gold-soft/60 px-6 py-14 text-center md:px-16 md:py-20">
        <BottleArt palette={["#5a1a2c", "#e9a3b5"]} shape="round" bare className="absolute -bottom-6 -left-8 hidden h-64 w-52 -rotate-12 opacity-80 md:block" />
        <BottleArt palette={["#12384a", "#7cc6d6"]} shape="tall" bare className="absolute -right-6 -bottom-8 hidden h-72 w-52 rotate-12 opacity-80 md:block" />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow">Not sure where to start?</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
            Meet your scent in <em className="text-gold">60 seconds</em>.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">
            Answer five quick questions about the moments, moods and notes you love — we&apos;ll match you with the Balincia scents made for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/quiz" className="btn btn-primary">
              Take the quiz
            </Link>
            <Link href="/collections/discovery-sets" className="btn btn-outline">
              Try a sample set
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
