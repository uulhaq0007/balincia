import { BriefcaseBusiness, CloudSun, Flower2, Leaf, Moon, Snowflake, Sparkles, Sun, Wine } from "lucide-react";
import { FAMILIES, LONGEVITY_LABELS, OCCASIONS, PERFORMANCE_LABELS, SEASONS } from "@/lib/constants";
import { cn, splitList } from "@/lib/utils";

type Props = {
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  longevity: number;
  sillage: number;
  seasons: string;
  occasions: string;
  families: string;
  palette: [string, string];
};

const SEASON_ICONS: Record<string, typeof Sun> = { spring: Flower2, summer: Sun, autumn: Leaf, winter: Snowflake };
const OCCASION_ICONS: Record<string, typeof Sun> = { day: Sun, night: Moon, office: BriefcaseBusiness, evening: Wine, signature: Sparkles };

export function FragrancePyramid({ topNotes, heartNotes, baseNotes, palette }: Pick<Props, "topNotes" | "heartNotes" | "baseNotes" | "palette">) {
  const tiers = [
    { title: "Top notes", sub: "The first impression · 0–30 min", notes: splitList(topNotes), width: "62%" },
    { title: "Heart notes", sub: "The character · 30 min – 4 hrs", notes: splitList(heartNotes), width: "80%" },
    { title: "Base notes", sub: "The memory · 4 hrs +", notes: splitList(baseNotes), width: "100%" },
  ];
  return (
    <div className="space-y-3">
      {tiers.map((t, i) => (
        <div key={t.title} className="mx-auto" style={{ width: t.width }}>
          <div
            className="rounded-2xl px-5 py-4 text-center"
            style={{ background: `${palette[1]}${["38", "70", "b0"][i]}` }}
          >
            <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase opacity-70">{t.title}</p>
            <p className="mt-1 font-display text-lg leading-snug">{t.notes.join(" · ") || "—"}</p>
            <p className="mt-0.5 text-[0.7rem] opacity-60">{t.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Meter({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold tracking-[0.14em] uppercase">{label}</span>
        <span className="text-sm text-ink-soft">{caption}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5" role="meter" aria-valuemin={1} aria-valuemax={5} aria-valuenow={value} aria-label={label}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cn("h-2 rounded-full", i <= value ? "bg-gold" : "bg-paper-3")} />
        ))}
      </div>
    </div>
  );
}

export function Performance({ longevity, sillage, seasons, occasions, families }: Omit<Props, "topNotes" | "heartNotes" | "baseNotes" | "palette">) {
  const activeSeasons = splitList(seasons);
  const activeOccasions = splitList(occasions);
  const familyLabels = splitList(families).map((f) => FAMILIES.find((x) => x.value === f)?.label ?? f);

  return (
    <div className="space-y-8">
      <Meter label="Longevity" value={longevity} caption={LONGEVITY_LABELS[longevity]} />
      <Meter label="Sillage" value={sillage} caption={PERFORMANCE_LABELS[sillage]} />

      <div>
        <p className="text-xs font-bold tracking-[0.14em] uppercase">Best seasons</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SEASONS.map((s) => {
            const Icon = SEASON_ICONS[s.value] ?? CloudSun;
            const on = activeSeasons.includes(s.value);
            return (
              <div key={s.value} className={cn("flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs", on ? "border-ink bg-ink text-paper" : "border-line text-muted")}>
                <Icon size={18} strokeWidth={1.5} />
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold tracking-[0.14em] uppercase">Wear it for</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => {
            const on = activeOccasions.includes(o.value);
            const Icon = OCCASION_ICONS[o.value] ?? Sun;
            return (
              <span key={o.value} className={cn("chip pointer-events-none", !on && "opacity-40")} data-active={on}>
                <Icon size={13} />
                {o.label}
              </span>
            );
          })}
        </div>
      </div>

      {familyLabels.length > 0 && (
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">Olfactive family:</span> {familyLabels.join(", ")}
        </p>
      )}
    </div>
  );
}
