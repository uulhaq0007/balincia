"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  size?: "sm" | "md";
};

export function QuantityStepper({ value, onChange, max = 99, min = 1, size = "md" }: Props) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white/60", h)}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={cn("grid place-items-center rounded-full text-ink-soft hover:text-ink disabled:opacity-30", size === "sm" ? "w-8" : "w-11")}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cn("grid place-items-center rounded-full text-ink-soft hover:text-ink disabled:opacity-30", size === "sm" ? "w-8" : "w-11")}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
