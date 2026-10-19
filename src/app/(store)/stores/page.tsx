import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { STORES } from "@/lib/constants";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Store locator", description: "Visit a Balincia boutique across Pakistan." };

export default function StoresPage() {
  const cities = [...new Set(STORES.map((s) => s.city))];
  return (
    <>
      <PageHero
        eyebrow="Boutiques"
        title={<>Smell it <em className="text-gold">in person</em></>}
        description={`${STORES.length} boutiques across ${cities.length} cities — with fragrance consultants ready to help you find your signature.`}
      />
      <div className="container-x space-y-14">
        {cities.map((city) => (
          <section key={city}>
            <h2 className="mb-5 flex items-baseline gap-3 font-display text-3xl">
              {city} <span className="font-sans text-sm text-muted">{STORES.filter((s) => s.city === city).length} locations</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {STORES.filter((s) => s.city === city).map((s) => (
                <div key={s.name} className="card p-6">
                  <p className="font-display text-xl">{s.name}</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    <li className="flex gap-2">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-gold" /> {s.address}
                    </li>
                    <li className="flex gap-2">
                      <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                      <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-ink">{s.phone}</a>
                    </li>
                    <li className="flex gap-2">
                      <Clock size={16} className="mt-0.5 shrink-0 text-gold" /> {s.hours}, daily
                    </li>
                  </ul>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm mt-5"
                  >
                    Get directions
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
