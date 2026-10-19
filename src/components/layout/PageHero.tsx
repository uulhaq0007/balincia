export function PageHero({ eyebrow, title, description }: { eyebrow?: string; title: React.ReactNode; description?: string }) {
  return (
    <section className="container-x py-12 text-center md:py-16">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-5xl leading-[1.05] text-balance md:text-6xl">{title}</h1>
      {description && <p className="mx-auto mt-4 max-w-xl text-ink-soft">{description}</p>}
    </section>
  );
}
