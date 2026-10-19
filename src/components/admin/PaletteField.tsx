"use client";

type Props = {
  value: [string, string];
  onChange: (value: [string, string]) => void;
  /** When set, also submits the palette as "#dark,#light" under this name. */
  name?: string;
  labels?: [string, string];
};

export function PaletteField({ value, onChange, name, labels = ["Deep tone", "Light tone"] }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {value.map((color, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-[#fffdf9] p-2 pr-3 transition hover:border-ink-soft"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => {
              const next: [string, string] = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
          <span className="min-w-0">
            <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-muted">{labels[i]}</span>
            <span className="block font-mono text-xs uppercase text-ink">{color}</span>
          </span>
        </label>
      ))}
      {name && <input type="hidden" name={name} value={value.join(",")} />}
    </div>
  );
}
