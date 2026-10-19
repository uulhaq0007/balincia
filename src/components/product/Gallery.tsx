"use client";

import { useState } from "react";
import { BottleArt } from "./BottleArt";
import { cn, parsePalette } from "@/lib/utils";

type Props = {
  name: string;
  images: string[];
  palette: string;
  bottleShape: string;
  notes: string[];
};

/** Uploaded photos when present; otherwise three generative "shots" (bottle, packaging, notes card). */
export function Gallery({ name, images, palette, bottleShape, notes }: Props) {
  const [dark, light] = parsePalette(palette);
  const [index, setIndex] = useState(0);

  const slides: React.ReactNode[] = images.length
    ? images.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={name} className="h-full w-full object-cover" />
      ))
    : [
        <BottleArt key="bottle" palette={[dark, light]} shape={bottleShape} name={name} className="h-full w-full" />,
        <div key="box" className="relative h-full w-full" style={{ background: `linear-gradient(160deg, ${light}55, ${light}cc)` }}>
          <BottleArt palette={[dark, light]} shape="box" name={name} bare className="absolute inset-x-[8%] bottom-0 h-[92%] w-[84%]" />
        </div>,
        <div key="notes" className="relative flex h-full w-full flex-col items-center justify-center gap-4 p-10 text-center" style={{ background: dark, color: "#f6f1e9" }}>
          <div className="grain absolute inset-0" />
          <p className="eyebrow" style={{ color: light }}>The composition</p>
          <p className="font-display text-4xl leading-tight italic md:text-5xl">{name}</p>
          <div className="mt-4 flex max-w-sm flex-wrap justify-center gap-2">
            {notes.slice(0, 8).map((n) => (
              <span key={n} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${light}66` }}>
                {n}
              </span>
            ))}
          </div>
        </div>,
      ];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:w-20",
              i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
            )}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
          >
            <div className="pointer-events-none h-full w-full">{slide}</div>
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[1.75rem] bg-paper-2">
        <div key={index} className="animate-fade-in h-full w-full">
          {slides[index]}
        </div>
      </div>
    </div>
  );
}
