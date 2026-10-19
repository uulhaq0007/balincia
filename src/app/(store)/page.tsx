import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { getProductRail } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { STORES } from "@/lib/constants";
import { Hero } from "@/components/home/Hero";
import { NotesMarquee } from "@/components/home/NotesMarquee";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeatureBanner } from "@/components/home/FeatureBanner";
import { FamilyExplorer } from "@/components/home/FamilyExplorer";
import { QuizBanner } from "@/components/home/QuizBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { Testimonials } from "@/components/home/Testimonials";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ProductRail } from "@/components/product/ProductRail";
import { PostCard } from "@/components/blog/PostCard";

export default async function HomePage() {
  const [bestSellers, giftSets, newArrivals, underTwo, heroPicks, reviewStats, productCount, reviews, posts, settings] = await Promise.all([
    getProductRail({ isBestseller: true }, [{ soldCount: "desc" }]),
    getProductRail({ category: { slug: "gift-sets" } }),
    getProductRail({ isNew: true }, [{ createdAt: "desc" }]),
    getProductRail({ price: { lte: 2000 }, concentration: { notIn: ["HOME"] } }, [{ soldCount: "desc" }]),
    db.product.findMany({
      where: { isActive: true, isFeatured: true, concentration: { in: ["EDP", "EXTRAIT"] } },
      orderBy: { soldCount: "desc" },
      take: 3,
      select: { name: true, slug: true, tagline: true, price: true, palette: true, bottleShape: true },
    }),
    db.review.aggregate({ where: { isApproved: true }, _avg: { rating: true }, _count: { _all: true } }),
    db.product.count({ where: { isActive: true } }),
    db.review.findMany({
      where: { isApproved: true, rating: 5 },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, rating: true, title: true, body: true, product: { select: { name: true, slug: true } } },
    }),
    db.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    getSettings(),
  ]);

  const ratingAvg = reviewStats._avg.rating ?? 5;
  const reviewCount = reviewStats._count._all;
  const [heroProduct, ...side] = heroPicks;
  const cities = new Set(STORES.map((s) => s.city));

  // Show each review only once per product so the carousel feels varied.
  const seen = new Set<string>();
  const uniqueReviews = reviews.filter((r) => !seen.has(r.product.slug) && seen.add(r.product.slug));

  return (
    <>
      {heroProduct && <Hero product={heroProduct} side={side} ratingAvg={ratingAvg} reviewCount={reviewCount} />}
      <NotesMarquee />
      <ProductRail
        eyebrow="Most loved"
        title={<>Our <em className="text-gold">best sellers</em></>}
        href="/collections/best-sellers"
        products={bestSellers}
      />
      <CategoryTiles />
      <FeatureBanner />
      <ProductRail
        eyebrow="Gifting, perfected"
        title={<>Gift sets for <em className="text-gold">every occasion</em></>}
        description="Keepsake boxes with satin ribbon and a handwritten note — ready for Eid, weddings and birthdays."
        href="/collections/gift-sets"
        products={giftSets}
      />
      <FamilyExplorer />
      <ProductRail eyebrow="Just landed" title={<>New <em className="text-gold">arrivals</em></>} href="/collections/new-arrivals" products={newArrivals} />
      <QuizBanner />
      <ProductRail
        eyebrow="Big character, gentle price"
        title={<>Under <em className="text-gold">Rs. 2,000</em></>}
        href="/collections/under-2000"
        products={underTwo}
      />
      <TrustSection
        freeShippingThreshold={settings.freeShippingThreshold}
        stats={[
          { value: ratingAvg.toFixed(1), label: "Average rating" },
          { value: reviewCount.toLocaleString(), label: "Verified reviews" },
          { value: String(productCount), label: "Scents in the library" },
          { value: String(STORES.length), label: `Boutiques in ${cities.size} cities` },
        ]}
      />
      <Testimonials reviews={uniqueReviews} />

      {posts.length > 0 && (
        <section className="container-x py-12 md:py-16">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="The Journal" title={<>Notes on <em className="text-gold">scent</em></>} />
            <Link href="/blog" className="mb-10 hidden items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase sm:inline-flex">
              <span className="link-underline">All stories</span> <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-12 md:py-16">
        <div className="grid items-center gap-8 rounded-[2rem] bg-paper-2 p-8 md:grid-cols-[1fr_1.2fr] md:p-14">
          <div>
            <p className="eyebrow">Visit a boutique</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              Smell it <em className="text-gold">in person</em>
            </h2>
            <p className="mt-3 max-w-md text-ink-soft">
              Our fragrance consultants will guide you through the library and help you layer your perfect signature.
            </p>
            <Link href="/stores" className="btn btn-primary mt-6">
              Find a store
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {STORES.slice(0, 6).map((s) => (
              <li key={s.name} className="flex gap-3 rounded-2xl bg-paper p-4">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">{s.city}</p>
                  <p className="text-sm font-semibold">{s.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
