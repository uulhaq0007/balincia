import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { BottleArt } from "@/components/product/BottleArt";
import { formatPrice } from "@/lib/format";
import { parsePalette } from "@/lib/utils";

type HeroProduct = { name: string; slug: string; tagline: string; price: number; palette: string; bottleShape: string };

export function Hero({ product, side, ratingAvg, reviewCount }: { product: HeroProduct; side: HeroProduct[]; ratingAvg: number; reviewCount: number }) {
  const [dark, light] = parsePalette(product.palette);
  return (
    <section className="container-x pt-6 pb-12 md:pt-10 md:pb-20">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="flex flex-col justify-center py-4 lg:py-10">
          <p className="eyebrow animate-fade-up">Maison de Parfum · Karachi</p>
          <h1 className="animate-fade-up mt-5 font-display text-[3.1rem] leading-[0.98] font-light tracking-tight text-balance sm:text-6xl xl:text-[5.6rem]" style={{ animationDelay: "80ms" }}>
            Scent is the story <em className="font-normal text-gold">you leave</em> behind.
          </h1>
          <p className="animate-fade-up mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft" style={{ animationDelay: "160ms" }}>
            Long-lasting, super-macerated perfumes and attars — composed with rare oils, aged for 30 days, and delivered to your door anywhere in Pakistan.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/collections/best-sellers" className="btn btn-primary">
              Shop best sellers <ArrowRight size={16} />
            </Link>
            <Link href="/quiz" className="btn btn-outline">
              Find my scent
            </Link>
          </div>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-soft" style={{ animationDelay: "320ms" }}>
            <span className="flex items-center gap-2">
              <span className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <strong className="text-ink">{ratingAvg.toFixed(1)}</strong> from {reviewCount.toLocaleString()} reviews
            </span>
            <span>Cash on delivery</span>
            <span>15-day exchanges</span>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] md:min-h-[560px]" style={{ background: `radial-gradient(120% 90% at 70% 20%, ${light}66 0%, transparent 55%), linear-gradient(160deg, ${dark} 0%, #120c09 100%)` }}>
          <div className="grain absolute inset-0" />
          <div className="absolute inset-x-0 top-10 text-center font-display text-[7rem] leading-none text-white/[0.06] italic md:text-[10rem]">
            {product.name.split(" ")[0]}
          </div>
          {side[0] && (
            <BottleArt palette={parsePalette(side[0].palette)} shape={side[0].bottleShape} name={side[0].name} bare className="absolute bottom-6 left-[2%] h-[48%] w-[34%] opacity-90 md:left-[6%]" />
          )}
          {side[1] && (
            <BottleArt palette={parsePalette(side[1].palette)} shape={side[1].bottleShape} name={side[1].name} bare className="absolute right-[2%] bottom-6 h-[44%] w-[32%] opacity-90 md:right-[5%]" />
          )}
          <BottleArt
            palette={[dark, light]}
            shape={product.bottleShape}
            name={product.name}
            bare
            className="animate-float absolute bottom-4 left-1/2 h-[78%] w-[62%] -translate-x-1/2 drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]"
          />
          <Link
            href={`/products/${product.slug}`}
            className="group absolute top-5 left-5 flex max-w-[15rem] items-center gap-3 rounded-2xl bg-paper/90 p-3 pr-4 backdrop-blur-md transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `${light}55` }}>
              <BottleArt palette={[dark, light]} shape={product.bottleShape} bare className="h-11 w-9" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.6rem] font-bold tracking-[0.18em] text-gold uppercase">Bestseller</span>
              <span className="block truncate font-display text-lg leading-tight">{product.name}</span>
              <span className="block text-xs text-ink-soft">from {formatPrice(product.price)}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
