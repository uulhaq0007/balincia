"use client";

import { X } from "lucide-react";
import { FAMILIES, GENDERS, GENRES, OCCASIONS, SEASONS, SORT_OPTIONS } from "@/lib/constants";
import { useFilterNavigation } from "./FilterPanel";
import { cn } from "@/lib/utils";

const LABELS: Record<string, Record<string, string>> = {
  gender: Object.fromEntries(GENDERS.map((o) => [o.value, o.label])),
  family: Object.fromEntries(FAMILIES.map((o) => [o.value, o.label])),
  season: Object.fromEntries(SEASONS.map((o) => [o.value, o.label])),
  genre: Object.fromEntries(GENRES.map((o) => [o.value, o.label])),
  occasion: Object.fromEntries(OCCASIONS.map((o) => [o.value, o.label])),
};

export function SortSelect({ defaultSort }: { defaultSort: string }) {
  const { searchParams, update, pending } = useFilterNavigation();
  return (
    <label className={cn("flex items-center gap-2 text-sm", pending && "opacity-60")}>
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        className="input h-10 w-auto rounded-full py-0 pr-9 text-sm font-semibold"
        value={searchParams.get("sort") ?? defaultSort}
        onChange={(e) =>
          update((p) => {
            if (e.target.value === defaultSort) p.delete("sort");
            else p.set("sort", e.target.value);
          })
        }
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ActiveFilters() {
  const { searchParams, update } = useFilterNavigation();
  const chips: { key: string; value?: string; label: string }[] = [];

  for (const key of Object.keys(LABELS)) {
    for (const v of (searchParams.get(key) ?? "").split(",").filter(Boolean)) {
      chips.push({ key, value: v, label: LABELS[key][v] ?? v });
    }
  }
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  if (min || max) chips.push({ key: "price", label: min && max ? `Rs. ${min} – ${max}` : min ? `Rs. ${min}+` : `Under Rs. ${max}` });
  if (searchParams.get("longevity")) chips.push({ key: "longevity", label: `Longevity ${searchParams.get("longevity")}+` });
  if (searchParams.get("sale") === "1") chips.push({ key: "sale", label: "On sale" });
  if (searchParams.get("q")) chips.push({ key: "q", label: `“${searchParams.get("q")}”` });

  if (!chips.length) return null;

  const remove = (chip: (typeof chips)[number]) =>
    update((p) => {
      if (chip.key === "price") {
        p.delete("min");
        p.delete("max");
      } else if (chip.value) {
        const rest = (p.get(chip.key) ?? "").split(",").filter((v) => v && v !== chip.value);
        if (rest.length) p.set(chip.key, rest.join(","));
        else p.delete(chip.key);
      } else p.delete(chip.key);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button key={`${chip.key}-${chip.value ?? ""}`} className="chip h-8 gap-1.5 bg-paper-2 text-xs" onClick={() => remove(chip)}>
          {chip.label} <X size={12} />
        </button>
      ))}
      <button
        className="text-xs font-semibold text-muted underline underline-offset-4 hover:text-ink"
        onClick={() =>
          update((p) => {
            for (const key of [...Object.keys(LABELS), "min", "max", "longevity", "sale", "q"]) p.delete(key);
          })
        }
      >
        Clear all
      </button>
    </div>
  );
}
