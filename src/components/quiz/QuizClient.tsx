"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QUIZ } from "@/lib/quiz";
import { cn } from "@/lib/utils";

export function QuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = QUIZ[step];

  const choose = (value: string) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step < QUIZ.length - 1) setTimeout(() => setStep(step + 1), 180);
    else router.push(`/quiz?${new URLSearchParams(next).toString()}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between text-xs font-bold tracking-[0.16em] text-muted uppercase">
        <span>
          Question {step + 1} of {QUIZ.length}
        </span>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper-3">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
      </div>

      <div key={step} className="animate-fade-up">
        <h2 className="mt-10 text-center font-display text-4xl leading-tight text-balance md:text-5xl">{q.question}</h2>
        <div className={cn("mt-10 grid gap-3", q.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
          {q.options.map((o) => {
            const selected = answers[q.key] === o.value;
            const color = "color" in o ? o.color : undefined;
            return (
              <button
                key={o.value}
                onClick={() => choose(o.value)}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5",
                  selected ? "border-ink bg-ink text-paper" : "border-line bg-white/70 hover:border-ink-soft",
                )}
              >
                {color && <span className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-40 blur-2xl" style={{ background: color }} />}
                <span className="relative block font-display text-2xl">{o.label}</span>
                <span className={cn("relative mt-1 block text-sm", selected ? "text-paper/70" : "text-ink-soft")}>{o.hint}</span>
                <ArrowRight size={18} className="relative mt-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
