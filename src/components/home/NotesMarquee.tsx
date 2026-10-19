const NOTES = [
  "Saffron",
  "Cambodian Oud",
  "Damask Rose",
  "Haitian Vetiver",
  "Jasmine Sambac",
  "Madagascan Vanilla",
  "Ambergris",
  "Tonka Bean",
  "Sandalwood",
  "Bergamot",
  "Petrichor",
  "Iris",
];

export function NotesMarquee() {
  const row = [...NOTES, ...NOTES];
  return (
    <div className="overflow-hidden border-y border-line bg-paper-2 py-5" aria-hidden>
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((note, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl text-ink-soft italic md:text-3xl">
            {note}
            <span className="text-base text-gold not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
