"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/lib/admin";
import { parsePalette, slugify } from "@/lib/utils";
import { FormMessage } from "./FormMessage";
import { PaletteField } from "./PaletteField";
import { SubmitButton } from "./SubmitButton";
import { useAdminForm } from "./useAdminForm";

type Category = {
  name: string;
  slug: string;
  description: string;
  palette: string;
  sortOrder: number;
  showInNav: boolean;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  category?: Category;
  nextSortOrder?: number;
};

export function CategoryForm({ action, category, nextSortOrder = 0 }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const blank = (): Category => ({
    name: "",
    slug: "",
    description: "",
    palette: "#2b2118,#c9a27a",
    sortOrder: nextSortOrder,
    showInNav: true,
  });
  const [values, setValues] = useState<Category>(() => category ?? blank());
  const slugTouched = useRef(Boolean(category));
  const palette = parsePalette(values.palette);

  // A successful create clears the form so the next category can be added.
  useEffect(() => {
    if (state?.ok && !category) {
      slugTouched.current = false;
      setValues(blank());
    }
  }, [state]);

  const set = <K extends keyof Category>(key: K, value: Category[K]) => setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div
        className="relative h-24 overflow-hidden rounded-xl"
        style={{ background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[0]} 35%, ${palette[1]} 100%)` }}
      >
        <p className="absolute bottom-3 left-4 font-display text-xl text-paper drop-shadow">{values.name || "Category name"}</p>
      </div>

      <div>
        <label htmlFor="c-name" className="label">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          className="input h-11"
          value={values.name}
          onChange={(e) => {
            const name = e.target.value;
            setValues((prev) => ({ ...prev, name, slug: slugTouched.current ? prev.slug : slugify(name) }));
          }}
          required
          maxLength={80}
        />
      </div>
      <div>
        <label htmlFor="c-slug" className="label">
          Slug
        </label>
        <input
          id="c-slug"
          name="slug"
          className="input h-11"
          value={values.slug}
          onChange={(e) => {
            slugTouched.current = true;
            set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          maxLength={80}
        />
        <p className="mt-1.5 text-xs text-muted">/collections/{values.slug || slugify(values.name) || "…"}</p>
      </div>
      <div>
        <label htmlFor="c-description" className="label">
          Description
        </label>
        <textarea
          id="c-description"
          name="description"
          className="input min-h-24"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={600}
        />
      </div>
      <div>
        <span className="label">Palette</span>
        <PaletteField name="palette" value={palette} onChange={(next) => set("palette", next.join(","))} />
      </div>
      <div className="grid grid-cols-2 items-end gap-3">
        <div>
          <label htmlFor="c-sort" className="label">
            Sort order
          </label>
          <input
            id="c-sort"
            name="sortOrder"
            type="number"
            step={1}
            className="input h-11"
            value={values.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
            required
          />
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="showInNav"
            checked={values.showInNav}
            onChange={(e) => set("showInNav", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Show in navigation
        </label>
      </div>
      <FormMessage state={state} />
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending} className="btn-sm flex-1">
          {category ? "Save category" : "Create category"}
        </SubmitButton>
        {category && (
          <Link href="/admin/categories" className="btn btn-ghost btn-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
