"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { FAMILIES, GENDERS, GENRES, OCCASIONS, SEASONS } from "@/lib/constants";
import { useScrollLock } from "@/store/ui";
import { cn } from "@/lib/utils";

const PRICE_RANGES = [
  { label: "Under Rs. 2,000", min: "", max: "2000" },
  { label: "Rs. 2,000 – 3,500", min: "2000", max: "3500" },
  { label: "Rs. 3,500 – 5,000", min: "3500", max: "5000" },
  { label: "Rs. 5,000 +", min: "5000", max: "" },
];

const LONGEVITY = [
  { label: "6+ hours", value: "3" },
  { label: "8+ hours", value: "4" },
  { label: "12+ hours", value: "5" },
];

type Group = { key: string; title: string; options: readonly { value: string; label: string }[] };

const GROUPS: Group[] = [
  { key: "gender", title: "Gender", options: GENDERS },
  { key: "family", title: "Scent family", options: FAMILIES },
  { key: "season", title: "Season", options: SEASONS },
  { key: "genre", title: "Genre", options: GENRES },
  { key: "occasion", title: "Occasion", options: OCCASIONS },
];

export function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  return { searchParams, update, pending };
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left text-[0.78rem] font-bold tracking-[0.14em] uppercase"
        onClick={onToggle}
        aria-expanded={open}
      >
        {title}
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function FilterBody({ hide = [] }: { hide?: string[] }) {
  const { searchParams, update } = useFilterNavigation();
  const [open, setOpen] = useState<Record<string, boolean>>({ gender: true, family: true, price: true });

  const values = (key: string) => (searchParams.get(key) ?? "").split(",").filter(Boolean);
  const toggle = (key: string, value: string) =>
    update((p) => {
      const current = new Set((p.get(key) ?? "").split(",").filter(Boolean));
      if (current.has(value)) current.delete(value);
      else current.add(value);
      if (current.size) p.set(key, [...current].join(","));
      else p.delete(key);
    });

  const min = searchParams.get("min") ?? "";
  const max = searchParams.get("max") ?? "";
  const longevity = searchParams.get("longevity") ?? "";
  const sale = searchParams.get("sale") === "1";

  const sectionProps = (id: string) => ({
    open: !!open[id],
    onToggle: () => setOpen((o) => ({ ...o, [id]: !o[id] })),
  });

  return (
    <div>
      {GROUPS.filter((g) => !hide.includes(g.key)).map((group) => {
        const selected = values(group.key);
        return (
          <Section key={group.key} title={group.title} {...sectionProps(group.key)}>
            <div className="flex flex-wrap gap-2">
              {group.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="chip"
                  data-active={selected.includes(o.value)}
                  onClick={() => toggle(group.key, o.value)}
                  aria-pressed={selected.includes(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Section>
        );
      })}

      <Section title="Price" {...sectionProps("price")}>
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => {
            const active = min === r.min && max === r.max;
            return (
              <label key={r.label} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="price"
                  checked={active}
                  onChange={() =>
                    update((p) => {
                      if (r.min) p.set("min", r.min);
                      else p.delete("min");
                      if (r.max) p.set("max", r.max);
                      else p.delete("max");
                    })
                  }
                  className="h-4 w-4 accent-[#16120f]"
                />
                {r.label}
              </label>
            );
          })}
          {(min || max) && (
            <button
              type="button"
              className="text-xs text-muted underline underline-offset-4"
              onClick={() =>
                update((p) => {
                  p.delete("min");
                  p.delete("max");
                })
              }
            >
              Clear price
            </button>
          )}
        </div>
      </Section>

      <Section title="Longevity" {...sectionProps("longevity")}>
        <div className="flex flex-wrap gap-2">
          {LONGEVITY.map((l) => (
            <button
              key={l.value}
              type="button"
              className="chip"
              data-active={longevity === l.value}
              onClick={() =>
                update((p) => {
                  if (longevity === l.value) p.delete("longevity");
                  else p.set("longevity", l.value);
                })
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <div className="py-5">
        <label className="flex cursor-pointer items-center justify-between text-[0.78rem] font-bold tracking-[0.14em] uppercase">
          On sale only
          <input
            type="checkbox"
            checked={sale}
            onChange={() =>
              update((p) => {
                if (sale) p.delete("sale");
                else p.set("sale", "1");
              })
            }
            className="h-4 w-4 accent-[#9b3a35]"
          />
        </label>
      </div>
    </div>
  );
}

export function FilterSidebar({ hide }: { hide?: string[] }) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <div className="sticky top-36">
        <FilterBody hide={hide} />
      </div>
    </aside>
  );
}

export function MobileFilterButton({ hide, count }: { hide?: string[]; count: number }) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);
  return (
    <>
      <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal size={14} /> Filters
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-display text-2xl">Filters</p>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-paper-2" aria-label="Close filters">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FilterBody hide={hide} />
            </div>
            <div className="border-t border-line p-4">
              <button className="btn btn-primary w-full" onClick={() => setOpen(false)}>
                Show {count} {count === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
