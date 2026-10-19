import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { getProductBySlug, productCardSelect } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { CONCENTRATIONS, GENDERS, GENRES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { parseImages, parsePalette, splitList } from "@/lib/utils";
import { Gallery } from "@/components/product/Gallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { FragrancePyramid, Performance } from "@/components/product/ScentProfile";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ProductRail } from "@/components/product/ProductRail";
import { Stars } from "@/components/ui/Stars";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description.slice(0, 160),
    openGraph: { title: product.name, description: product.tagline },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, session, settings] = await Promise.all([getProductBySlug(slug), getSession(), getSettings()]);
  if (!product) notFound();

  const families = splitList(product.families);
  const related = await db.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
      OR: [{ categoryId: product.categoryId }, ...families.slice(0, 2).map((f) => ({ families: { contains: f } }))],
    },
    orderBy: { soldCount: "desc" },
    take: 4,
    select: productCardSelect,
  });

  const palette = parsePalette(product.palette);
  const images = parseImages(product.images);
  const notes = [...splitList(product.topNotes), ...splitList(product.heartNotes), ...splitList(product.baseNotes)];
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));
  const concentration = CONCENTRATIONS.find((c) => c.value === product.concentration)?.label ?? product.concentration;
  const isFragrance = !["HOME", "SET"].includes(product.concentration);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Balincia" },
    category: product.category.name,
    ...(product.ratingCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.ratingCount },
    }),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: v.label,
      price: v.price,
      priceCurrency: "PKR",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-x pt-4">
        <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="container-x mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Gallery name={product.name} images={images} palette={product.palette} bottleShape={product.bottleShape} notes={notes} />

        <div className="lg:sticky lg:top-36 lg:self-start">
          <p className="eyebrow">
            {product.category.name} · {concentration}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-[1.02] md:text-6xl">{product.name}</h1>
          <p className="mt-2 text-lg text-ink-soft italic">{product.tagline}</p>
          {product.ratingCount > 0 && (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm">
              <Stars rating={product.ratingAvg} />
              <span className="font-semibold">{product.ratingAvg.toFixed(1)}</span>
              <span className="text-muted underline underline-offset-4">{product.ratingCount} reviews</span>
            </a>
          )}

          <div className="mt-7 border-t border-line pt-7">
            <PurchasePanel
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                palette: product.palette,
                bottleShape: product.bottleShape,
                images: product.images,
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                label: v.label,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock,
              }))}
              freeShippingThreshold={settings.freeShippingThreshold}
            />
          </div>

          <ul className="mt-8 divide-y divide-line rounded-2xl border border-line text-sm">
            <li className="flex gap-3 p-4">
              <Truck size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                <strong>Delivery in 2–4 working days</strong> nationwide · Cash on delivery available · Express 24–48 hrs in major cities
              </span>
            </li>
            <li className="flex gap-3 p-4">
              <RotateCcw size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                <strong>15-day exchanges & returns</strong> on unused, sealed bottles.{" "}
                <Link href="/policies/returns" className="underline underline-offset-4">Details</Link>
              </span>
            </li>
            <li className="flex gap-3 p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                <strong>Authentic & freshly made</strong> — macerated for 30 days and sealed in our Karachi atelier.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="container-x mt-20 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow">The story</p>
          <p className="mt-4 font-display text-2xl leading-relaxed text-pretty md:text-[1.7rem]">{product.description}</p>
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm sm:grid-cols-4">
            {[
              ["Concentration", concentration],
              ["For", GENDERS.find((g) => g.value === product.gender)?.label ?? product.gender],
              ["Genre", GENRES.find((g) => g.value === product.genre)?.label ?? product.genre],
              ["Sizes", product.variants.map((v) => v.label).join(" / ")],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper p-4">
                <dt className="text-[0.65rem] font-bold tracking-[0.16em] text-muted uppercase">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {isFragrance && (
          <div className="card p-6 md:p-8">
            <p className="eyebrow mb-6">Performance & wear</p>
            <Performance
              longevity={product.longevity}
              sillage={product.sillage}
              seasons={product.seasons}
              occasions={product.occasions}
              families={product.families}
            />
          </div>
        )}
      </section>

      {notes.length > 0 && (
        <section className="container-x mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Fragrance pyramid</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">How it unfolds</h2>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <FragrancePyramid topNotes={product.topNotes} heartNotes={product.heartNotes} baseNotes={product.baseNotes} palette={palette} />
          </div>
        </section>
      )}

      <section id="reviews" className="container-x mt-24 scroll-mt-40">
        <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-3 font-display text-4xl">What people say</h2>
            {product.ratingCount > 0 ? (
              <>
                <div className="mt-6 flex items-end gap-3">
                  <span className="font-display text-6xl leading-none">{product.ratingAvg.toFixed(1)}</span>
                  <div className="pb-1">
                    <Stars rating={product.ratingAvg} size={16} />
                    <p className="mt-1 text-xs text-muted">Based on {product.ratingCount} reviews</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-2">
                  {distribution.map((d) => (
                    <li key={d.star} className="flex items-center gap-3 text-xs">
                      <span className="w-6 font-semibold">{d.star}★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-3">
                        <span
                          className="block h-full rounded-full bg-gold"
                          style={{ width: `${product.reviews.length ? (d.count / product.reviews.length) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="w-6 text-right text-muted">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-ink-soft">No reviews yet — be the first to share your experience.</p>
            )}
            <div className="mt-8">
              <ReviewForm productId={product.id} defaultName={session?.name} />
            </div>
          </div>
          <ul className="divide-y divide-line">
            {product.reviews.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-3 font-display text-xl">{r.title}</p>}
                <p className="mt-1.5 leading-relaxed text-ink-soft">{r.body}</p>
                <p className="mt-3 text-xs font-semibold tracking-wider uppercase">
                  {r.name} {r.userId && <span className="ml-1 font-normal text-sage normal-case">· Balincia member</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProductRail eyebrow="You may also love" title={<>Pairs well <em className="text-gold">with</em></>} products={related} />
    </>
  );
}
