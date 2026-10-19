import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BottleArt } from "@/components/product/BottleArt";
import { SectionHeading } from "./SectionHeading";

const TILES = [
  { title: "For Him", href: "/collections/men", palette: ["#141820", "#7d8ca3"], shape: "classic", span: "lg:col-span-2 lg:row-span-2" },
  { title: "For Her", href: "/collections/women", palette: ["#5a1a2c", "#e9a3b5"], shape: "round", span: "lg:col-span-2 lg:row-span-2" },
  { title: "Attars", href: "/collections/attars", palette: ["#4a1a08", "#e0a03a"], shape: "attar", span: "" },
  { title: "Gift Sets", href: "/collections/gift-sets", palette: ["#2a1a10", "#d4a373"], shape: "box", span: "" },
  { title: "Discovery", href: "/collections/discovery-sets", palette: ["#3a2a1c", "#e8d5b5"], shape: "box", span: "" },
  { title: "Home", href: "/collections/home-fragrance", palette: ["#4a3a20", "#d9c08a"], shape: "diffuser", span: "" },
] as const;

export function CategoryTiles() {
  return (
    <section className="container-x py-12 md:py-16">
      <SectionHeading eyebrow="Shop by world" title={<>Every scent has a <em className="text-gold">home</em></>} />
      <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[230px] md:gap-4 lg:grid-cols-6">
        {TILES.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className={`group relative overflow-hidden rounded-3xl p-5 md:p-6 ${t.span}`}
            style={{ background: `linear-gradient(150deg, ${t.palette[1]}55, ${t.palette[1]}cc)` }}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <span className="font-display text-2xl leading-none md:text-3xl" style={{ color: t.palette[0] }}>
                {t.title}
              </span>
              <span
                className="grid h-10 w-10 place-items-center rounded-full bg-paper/80 transition-transform duration-300 group-hover:rotate-45"
                style={{ color: t.palette[0] }}
              >
                <ArrowUpRight size={18} />
              </span>
            </div>
            <BottleArt
              palette={[t.palette[0], t.palette[1]]}
              shape={t.shape}
              bare
              className="absolute -right-4 -bottom-3 h-[92%] w-[70%] transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
