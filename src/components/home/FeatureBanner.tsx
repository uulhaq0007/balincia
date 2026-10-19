import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BottleArt } from "@/components/product/BottleArt";

export function FeatureBanner() {
  return (
    <section className="container-x py-12 md:py-16">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-[#120b08] text-paper md:grid-cols-2">
        <div className="grain absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-center p-8 md:p-14 lg:p-20">
          <p className="eyebrow text-gold-2">The Noir Collection</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">
            After dark,
            <br />
            <em className="text-gold-2">everything</em> lingers.
          </h2>
          <p className="mt-5 max-w-md text-paper/70">
            Four extraits de parfum at 30% concentration — genuine Cambodian oud, black iris, smoked leather and imperial amber.
            Built for 12+ hours on skin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/collections/noir" className="btn btn-light">
              Explore Noir <ArrowRight size={16} />
            </Link>
            <Link href="/products/noir-discovery-set" className="btn border border-paper/30 text-paper hover:bg-paper/10">
              Try the minis
            </Link>
          </div>
        </div>
        <div className="relative min-h-[360px] md:min-h-[520px]">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_55%,rgba(201,162,122,0.35),transparent_70%)]" />
          <BottleArt palette={["#1d1428", "#8a6aa8"]} shape="classic" name="Obsidian Iris" bare className="absolute bottom-6 left-[4%] h-[56%] w-[36%]" />
          <BottleArt palette={["#3a1206", "#d9822b"]} shape="round" name="Ambre Imperial" bare className="absolute right-[4%] bottom-6 h-[52%] w-[36%]" />
          <BottleArt palette={["#1a0a08", "#8b3a2a"]} shape="tall" name="Noir Oud Royale" bare className="animate-float absolute bottom-6 left-1/2 h-[82%] w-[46%] -translate-x-1/2" />
        </div>
      </div>
    </section>
  );
}
