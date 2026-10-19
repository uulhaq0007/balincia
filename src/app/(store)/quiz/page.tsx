import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { PERSONAS, QUIZ, scoreProduct, type QuizAnswers } from "@/lib/quiz";
import { param, parsePalette } from "@/lib/utils";
import { QuizClient } from "@/components/quiz/QuizClient";
import { ProductGrid } from "@/components/product/ProductRail";
import { BottleArt } from "@/components/product/BottleArt";

export const metadata: Metadata = {
  title: "Scent quiz — find your signature",
  description: "Answer five quick questions and discover the Balincia perfumes made for you.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function QuizPage({ searchParams }: Props) {
  const sp = await searchParams;
  const answers = Object.fromEntries(QUIZ.map((q) => [q.key, param(sp[q.key]) ?? ""])) as QuizAnswers;
  const complete = QUIZ.every((q) => q.options.some((o) => o.value === answers[q.key as keyof QuizAnswers]));

  if (!complete) {
    return (
      <div className="container-x py-12 md:py-20">
        <div className="mb-12 text-center">
          <p className="eyebrow">The scent quiz</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">
            Find your <em className="text-gold">signature</em>
          </h1>
        </div>
        <QuizClient />
      </div>
    );
  }

  const candidates = await db.product.findMany({
    where: { isActive: true, concentration: { notIn: ["HOME", "SET", "MIST"] } },
    select: { ...productCardSelect, occasions: true, seasons: true, sillage: true },
  });
  const ranked = candidates
    .map((p) => ({ p, score: scoreProduct(p, answers) }))
    .sort((a, b) => b.score - a.score || b.p.ratingAvg - a.p.ratingAvg)
    .slice(0, 4)
    .map((r) => r.p);

  const persona = PERSONAS[answers.vibe] ?? PERSONAS.warm;
  const [dark, light] = parsePalette(persona.palette);

  return (
    <div className="container-x py-12 md:py-16">
      <section className="relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-paper md:py-20" style={{ background: `radial-gradient(80% 80% at 50% 0%, ${light}55, transparent 60%), ${dark}` }}>
        <div className="grain absolute inset-0" />
        <BottleArt palette={[dark, light]} shape="round" bare className="absolute -bottom-10 -left-10 hidden h-72 w-60 -rotate-12 opacity-70 md:block" />
        <BottleArt palette={[dark, light]} shape="tall" bare className="absolute -right-6 -bottom-12 hidden h-80 w-56 rotate-12 opacity-70 md:block" />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow" style={{ color: light }}>Your scent persona</p>
          <h1 className="mt-4 font-display text-5xl md:text-7xl">{persona.name}</h1>
          <p className="mx-auto mt-5 max-w-lg text-paper/80">{persona.description}</p>
          <Link href="/quiz" className="mt-8 inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase opacity-80 hover:opacity-100">
            <RotateCcw size={14} /> Retake the quiz
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Matched for you</p>
            <h2 className="mt-2 font-display text-4xl">Your top four</h2>
          </div>
          <Link href="/products/top-5-discovery-set" className="btn btn-outline btn-sm">
            Not sure? Try the discovery set
          </Link>
        </div>
        <ProductGrid products={ranked} />
      </section>
    </div>
  );
}
