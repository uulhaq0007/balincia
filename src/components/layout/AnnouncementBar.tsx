"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || messages.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [paused, messages.length]);

  if (!messages.length) return null;
  const go = (d: number) => setIndex((i) => (i + d + messages.length) % messages.length);

  return (
    <div
      className="bg-ink text-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
    >
      <div className="container-x flex h-9 items-center justify-between gap-4 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
        <button onClick={() => go(-1)} className="p-1 text-paper/60 hover:text-paper" aria-label="Previous announcement">
          <ChevronLeft size={14} />
        </button>
        <p key={index} className="animate-fade-in truncate text-center" aria-live="polite">
          {messages[index]}
        </p>
        <button onClick={() => go(1)} className="p-1 text-paper/60 hover:text-paper" aria-label="Next announcement">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
