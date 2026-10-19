"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { BottleArt } from "@/components/product/BottleArt";
import {
  BOTTLE_SHAPES,
  CONCENTRATIONS,
  FAMILIES,
  GENDERS,
  GENRES,
  LONGEVITY_LABELS,
  OCCASIONS,
  PERFORMANCE_LABELS,
  SEASONS,
} from "@/lib/constants";
import { suggestSku, type ActionState } from "@/lib/admin";
import { cn, slugify, titleCase } from "@/lib/utils";
import { FormMessage } from "./FormMessage";
import { ImageListField } from "./ImageListField";
import { PaletteField } from "./PaletteField";
import { SubmitButton } from "./SubmitButton";
import { Switch } from "./Switch";
import { useAdminForm } from "./useAdminForm";

type VariantRow = {
  key: string;
  id?: string;
  label: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categoryId: string;
  gender: string;
  concentration: string;
  genre: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  families: string[];
  seasons: string[];
  occasions: string[];
  longevity: number;
  sillage: number;
  images: string[];
  palette: [string, string];
  bottleShape: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  variants: { id?: string; label: string; sku: string; price: number; compareAtPrice: number | null; stock: number }[];
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { id: string; name: string }[];
  initial?: ProductFormValues;
  /** Storefront URL, shown once the product exists. */
  storeHref?: string;
  /** Extra controls rendered under the save button (e.g. delete). */
  footer?: React.ReactNode;
};

let rowSeq = 0;
const rowKey = () => `row-${++rowSeq}`;

const blankVariant = (): VariantRow => ({ key: rowKey(), label: "", sku: "", price: "", compareAtPrice: "", stock: "0" });

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            className="chip"
            data-active={active}
            aria-pressed={active}
            onClick={() => onChange(active ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Scale({
  value,
  onChange,
  labels,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: Record<number, string>;
  name: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-1 rounded-xl border border-line bg-[#fffdf9] p-1" role="radiogroup" aria-label={name}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "h-9 rounded-lg text-sm font-semibold tabular-nums transition",
              value === n ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted">{labels[value]}</p>
    </div>
  );
}

export function ProductForm({ action, categories, initial, storeHref, footer }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const [v, setV] = useState(() => ({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    gender: initial?.gender ?? "UNISEX",
    concentration: initial?.concentration ?? "EDP",
    genre: initial?.genre ?? "WESTERN",
    topNotes: initial?.topNotes ?? "",
    heartNotes: initial?.heartNotes ?? "",
    baseNotes: initial?.baseNotes ?? "",
    families: initial?.families ?? [],
    seasons: initial?.seasons ?? [],
    occasions: initial?.occasions ?? [],
    longevity: initial?.longevity ?? 3,
    sillage: initial?.sillage ?? 3,
    images: initial?.images ?? [],
    palette: initial?.palette ?? (["#2b2118", "#c9a27a"] as [string, string]),
    bottleShape: initial?.bottleShape ?? "classic",
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
    isBestseller: initial?.isBestseller ?? false,
    isNew: initial?.isNew ?? true,
  }));
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    initial?.variants.length
      ? initial.variants.map((variant) => ({
          key: rowKey(),
          id: variant.id,
          label: variant.label,
          sku: variant.sku,
          price: String(variant.price),
          compareAtPrice: variant.compareAtPrice != null ? String(variant.compareAtPrice) : "",
          stock: String(variant.stock),
        }))
      : [blankVariant()],
  );
  // New products derive the slug from the name until the admin edits it by hand.
  const slugTouched = useRef(Boolean(initial));

  // Adopt ids of newly created variants so the next save updates rather than recreates them.
  useEffect(() => {
    const ids = state?.ids;
    if (ids) setVariants((rows) => rows.map((row, i) => (ids[i] ? { ...row, id: ids[i] } : row)));
  }, [state]);

  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV((prev) => ({ ...prev, [key]: value }));

  function setName(name: string) {
    setV((prev) => ({ ...prev, name, slug: slugTouched.current ? prev.slug : slugify(name) }));
  }

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  const effectiveSlug = v.slug || slugify(v.name);
  const payload = JSON.stringify({
    ...v,
    slug: effectiveSlug,
    variants: variants.map(({ key: _key, ...row }) => ({ ...row, sku: row.sku.trim() || suggestSku(effectiveSlug, row.label) })),
  });
  const totalStock = variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <input type="hidden" name="payload" value={payload} />

      <div className="min-w-0 space-y-6">
        <Section title="Basics">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name" htmlFor="p-name">
              <input
                id="p-name"
                className="input"
                value={v.name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                placeholder="e.g. Oud Royale"
              />
            </Field>
            <Field label="URL slug" htmlFor="p-slug" hint={`/products/${effectiveSlug || "…"}`}>
              <input
                id="p-slug"
                className="input"
                value={v.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                onBlur={() => set("slug", slugify(v.slug))}
                maxLength={140}
                placeholder="oud-royale"
              />
            </Field>
          </div>
          <Field label="Tagline" htmlFor="p-tagline" hint="One evocative line shown under the name.">
            <input
              id="p-tagline"
              className="input"
              value={v.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              maxLength={200}
              placeholder="Smoked agarwood, saffron and rose"
            />
          </Field>
          <Field label="Description" htmlFor="p-description">
            <textarea
              id="p-description"
              className="input min-h-36"
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={6000}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Category" htmlFor="p-category">
              <select
                id="p-category"
                className="input"
                value={v.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                required
              >
                {categories.length === 0 && <option value="">Create a category first</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="For" htmlFor="p-gender">
              <select id="p-gender" className="input" value={v.gender} onChange={(e) => set("gender", e.target.value)}>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Concentration" htmlFor="p-concentration">
              <select
                id="p-concentration"
                className="input"
                value={v.concentration}
                onChange={(e) => set("concentration", e.target.value)}
              >
                {CONCENTRATIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Genre" htmlFor="p-genre">
              <select id="p-genre" className="input" value={v.genre} onChange={(e) => set("genre", e.target.value)}>
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Scent profile" description="Notes are comma separated, e.g. “Bergamot, Pink pepper, Saffron”.">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Top notes" htmlFor="p-top">
              <input id="p-top" className="input" value={v.topNotes} onChange={(e) => set("topNotes", e.target.value)} />
            </Field>
            <Field label="Heart notes" htmlFor="p-heart">
              <input id="p-heart" className="input" value={v.heartNotes} onChange={(e) => set("heartNotes", e.target.value)} />
            </Field>
            <Field label="Base notes" htmlFor="p-base">
              <input id="p-base" className="input" value={v.baseNotes} onChange={(e) => set("baseNotes", e.target.value)} />
            </Field>
          </div>
          <Field label="Families">
            <ChipGroup options={FAMILIES} selected={v.families} onChange={(next) => set("families", next)} />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Seasons">
              <ChipGroup options={SEASONS} selected={v.seasons} onChange={(next) => set("seasons", next)} />
            </Field>
            <Field label="Occasions">
              <ChipGroup options={OCCASIONS} selected={v.occasions} onChange={(next) => set("occasions", next)} />
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Longevity">
              <Scale name="Longevity" value={v.longevity} onChange={(n) => set("longevity", n)} labels={LONGEVITY_LABELS} />
            </Field>
            <Field label="Sillage">
              <Scale name="Sillage" value={v.sillage} onChange={(n) => set("sillage", n)} labels={PERFORMANCE_LABELS} />
            </Field>
          </div>
        </Section>

        <Section
          title="Variants"
          description={`Sizes or formats with their own price and stock · ${totalStock.toLocaleString()} units in total. Leave SKU blank to generate one.`}
        >
          <div className="space-y-3">
            <div className="hidden grid-cols-[1fr_1.4fr_1fr_1fr_0.8fr_2.25rem] gap-2 px-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted md:grid">
              <span>Label</span>
              <span>SKU</span>
              <span>Price (Rs.)</span>
              <span>Compare-at</span>
              <span>Stock</span>
              <span />
            </div>
            {variants.map((row, index) => (
              <div
                key={row.key}
                className="grid grid-cols-2 gap-2 rounded-xl border border-line p-3 md:grid-cols-[1fr_1.4fr_1fr_1fr_0.8fr_2.25rem] md:border-0 md:p-0"
              >
                <input
                  className="input h-11"
                  value={row.label}
                  onChange={(e) => updateVariant(row.key, { label: e.target.value })}
                  placeholder="50ml"
                  aria-label={`Variant ${index + 1} label`}
                  required
                  maxLength={40}
                />
                <input
                  className="input h-11 font-mono text-xs uppercase"
                  value={row.sku}
                  onChange={(e) => updateVariant(row.key, { sku: e.target.value.toUpperCase() })}
                  placeholder={suggestSku(effectiveSlug, row.label)}
                  aria-label={`Variant ${index + 1} SKU`}
                  maxLength={60}
                />
                <input
                  className="input h-11 tabular-nums"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={row.price}
                  onChange={(e) => updateVariant(row.key, { price: e.target.value })}
                  placeholder="Price"
                  aria-label={`Variant ${index + 1} price`}
                  required
                />
                <input
                  className="input h-11 tabular-nums"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={row.compareAtPrice}
                  onChange={(e) => updateVariant(row.key, { compareAtPrice: e.target.value })}
                  placeholder="—"
                  aria-label={`Variant ${index + 1} compare-at price`}
                />
                <input
                  className="input h-11 tabular-nums"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={row.stock}
                  onChange={(e) => updateVariant(row.key, { stock: e.target.value })}
                  aria-label={`Variant ${index + 1} stock`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVariants((rows) => rows.filter((r) => r.key !== row.key))}
                  disabled={variants.length === 1}
                  className="flex h-11 items-center justify-center rounded-xl text-muted transition hover:bg-rose-50 hover:text-sale disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label={`Remove variant ${index + 1}`}
                  title={variants.length === 1 ? "A product needs at least one variant" : "Remove variant"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setVariants((rows) => [...rows, blankVariant()])} className="btn btn-outline btn-sm">
            <Plus size={15} /> Add variant
          </button>
        </Section>

        <Section title="Media" description="Upload photos, or rely on the generative bottle art built from the palette and shape.">
          <ImageListField images={v.images} onChange={(images) => set("images", images)} />
          <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-[1fr_200px]">
            <div className="space-y-5">
              <Field label="Bottle palette">
                <PaletteField value={v.palette} onChange={(palette) => set("palette", palette)} />
              </Field>
              <Field label="Bottle shape" htmlFor="p-shape">
                <select id="p-shape" className="input" value={v.bottleShape} onChange={(e) => set("bottleShape", e.target.value)}>
                  {BOTTLE_SHAPES.map((shape) => (
                    <option key={shape} value={shape}>
                      {titleCase(shape)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <figure>
              <div className="aspect-[4/5] overflow-hidden rounded-xl border border-line">
                <BottleArt palette={v.palette} shape={v.bottleShape} name={v.name} className="h-full w-full" />
              </div>
              <figcaption className="mt-1.5 text-center text-xs text-muted">Live bottle preview</figcaption>
            </figure>
          </div>
        </Section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="card p-5">
          <h2 className="font-display text-lg text-ink">Visibility</h2>
          <div className="mt-3 divide-y divide-line">
            <Switch checked={v.isActive} onChange={(c) => set("isActive", c)} label="Active" hint="Visible and purchasable in the store" />
            <Switch checked={v.isFeatured} onChange={(c) => set("isFeatured", c)} label="Featured" hint="Ranks first in default sorting" />
            <Switch checked={v.isBestseller} onChange={(c) => set("isBestseller", c)} label="Bestseller" hint="Shows the Bestseller badge" />
            <Switch checked={v.isNew} onChange={(c) => set("isNew", c)} label="New" hint="Appears in New Arrivals" />
          </div>
          <div className="mt-5 space-y-3">
            <FormMessage state={state} />
            <SubmitButton pending={pending} pendingLabel="Saving…" className="w-full" disabled={categories.length === 0}>
              {initial ? "Save changes" : "Create product"}
            </SubmitButton>
            {storeHref && (
              <Link href={storeHref} target="_blank" className="btn btn-ghost btn-sm w-full">
                <ExternalLink size={14} /> View in store
              </Link>
            )}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="aspect-[4/5] bg-paper-2">
            {v.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <BottleArt palette={v.palette} shape={v.bottleShape} name={v.name} className="h-full w-full" />
            )}
          </div>
          <div className="p-4">
            <p className="font-display text-lg leading-tight text-ink">{v.name || "Untitled product"}</p>
            {v.tagline && <p className="mt-0.5 text-xs text-muted">{v.tagline}</p>}
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gold">Card preview</p>
          </div>
        </section>

        {footer}
      </aside>
    </form>
  );
}
