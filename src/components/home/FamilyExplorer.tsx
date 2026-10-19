import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

const FAMILIES = [
  { value: "woody", label: "Woody", desc: "Cedar, vetiver, sandalwood", color: "#7a5a3a" },
  { value: "oud", label: "Oud", desc: "Smoky, resinous, regal", color: "#3b1d12" },
  { value: "floral", label: "Floral", desc: "Rose, jasmine, tuberose", color: "#c0607a" },
  { value: "fresh", label: "Fresh", desc: "Clean, airy, green", color: "#5a8a7a" },
  { value: "citrus", label: "Citrus", desc: "Lemon, bergamot, lime", color: "#d0a020" },
  { value: "oriental", label: "Oriental", desc: "Amber, spice, resin", color: "#a0522d" },
  { value: "gourmand", label: "Gourmand", desc: "Vanilla, tonka, praline", color: "#9a6a4a" },
  { value: "aquatic", label: "Aquatic", desc: "Sea salt, marine, mint", color: "#2a6a8a" },
];

export function FamilyExplorer() {
  return (
    <section className="bg-paper-2 py-16 md:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Shop by note"
          title={<>What does your <em className="text-gold">mood</em> smell like?</>}
          description="Every Balincia scent is mapped to its olfactive family. Start with what you love."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FAMILIES.map((f) => (
            <Link
              key={f.value}
              href={`/shop?family=${f.value}`}
              className="group relative overflow-hidden rounded-2xl border border-line bg-paper p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 md:p-6"
            >
              <span
                className="absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: f.color }}
              />
              <span className="mb-6 block h-3 w-3 rounded-full" style={{ background: f.color }} />
              <span className="block font-display text-2xl">{f.label}</span>
              <span className="mt-1 block text-sm text-ink-soft">{f.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
