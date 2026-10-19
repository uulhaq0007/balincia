"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Markdown } from "@/lib/markdown";
import type { ActionState } from "@/lib/admin";
import { cn, parsePalette, slugify } from "@/lib/utils";
import { FormMessage } from "./FormMessage";
import { PaletteField } from "./PaletteField";
import { PostCover } from "./PostCover";
import { SubmitButton } from "./SubmitButton";
import { Switch } from "./Switch";
import { useAdminForm } from "./useAdminForm";

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  palette: string;
  author: string;
  published: boolean;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: PostFormValues;
  /** Storefront URL, shown once the post exists. */
  storeHref?: string;
  footer?: React.ReactNode;
};

const FORMATTING_HELP = [
  ["## Heading", "section heading"],
  ["- item", "bullet list"],
  ["**bold**", "bold text"],
  ["[text](https://…)", "link"],
] as const;

export function PostForm({ action, initial, storeHref, footer }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const [values, setValues] = useState<PostFormValues>(
    () =>
      initial ?? {
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        palette: "#2b2118,#c9a27a",
        author: "Balincia Editorial",
        published: true,
      },
  );
  const [tab, setTab] = useState<"write" | "preview">("write");
  const slugTouched = useRef(Boolean(initial));
  const palette = parsePalette(values.palette);
  const effectiveSlug = values.slug || slugify(values.title);
  const words = values.content.trim() ? values.content.trim().split(/\s+/).length : 0;

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <section className="card space-y-5 p-5 md:p-6">
          <div>
            <label htmlFor="post-title" className="label">
              Title
            </label>
            <input
              id="post-title"
              name="title"
              className="input font-display text-lg"
              value={values.title}
              onChange={(e) => {
                const title = e.target.value;
                setValues((prev) => ({ ...prev, title, slug: slugTouched.current ? prev.slug : slugify(title) }));
              }}
              required
              maxLength={160}
              placeholder="How to layer an attar with your perfume"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="post-slug" className="label">
                URL slug
              </label>
              <input
                id="post-slug"
                name="slug"
                className="input"
                value={values.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                onBlur={() => set("slug", slugify(values.slug))}
                maxLength={160}
              />
              <p className="mt-1.5 text-xs text-muted">/blog/{effectiveSlug || "…"}</p>
            </div>
            <div>
              <label htmlFor="post-author" className="label">
                Author
              </label>
              <input
                id="post-author"
                name="author"
                className="input"
                value={values.author}
                onChange={(e) => set("author", e.target.value)}
                required
                maxLength={80}
              />
            </div>
          </div>
          <div>
            <label htmlFor="post-excerpt" className="label">
              Excerpt
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              className="input min-h-20"
              value={values.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              maxLength={400}
              placeholder="One or two sentences shown on journal cards and in search results."
            />
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <div className="flex gap-1" role="tablist" aria-label="Content editor">
              {(["write", "preview"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition",
                    tab === t ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted tabular-nums">
              {words.toLocaleString()} words · ~{Math.max(1, Math.round(words / 200))} min read
            </span>
          </div>
          {/* The textarea stays mounted (just hidden) so it's always submitted. */}
          <div className={cn("p-5", tab !== "write" && "hidden")}>
            <label htmlFor="post-content" className="sr-only">
              Content
            </label>
            <textarea
              id="post-content"
              name="content"
              className="input min-h-[26rem] font-mono text-sm leading-relaxed"
              value={values.content}
              onChange={(e) => set("content", e.target.value)}
              maxLength={50_000}
              placeholder={"Start with an opening paragraph.\n\n## A section heading\n\nSeparate paragraphs with a blank line.\n\n- Bullet one\n- Bullet two"}
            />
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
              {FORMATTING_HELP.map(([syntax, meaning]) => (
                <li key={syntax}>
                  <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-ink-soft">{syntax}</code> {meaning}
                </li>
              ))}
              <li>Blank line = new paragraph</li>
            </ul>
          </div>
          {tab === "preview" && (
            <div className="px-5 py-6 md:px-8">
              {values.content.trim() ? (
                <article className="prose-balincia mx-auto max-w-2xl">
                  <h1 className="mb-6 font-display text-3xl leading-tight text-ink">{values.title || "Untitled"}</h1>
                  <Markdown source={values.content} />
                </article>
              ) : (
                <p className="py-16 text-center text-sm text-muted">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="card p-5">
          <h2 className="font-display text-lg text-ink">Publishing</h2>
          <div className="mt-2">
            <Switch
              name="published"
              checked={values.published}
              onChange={(c) => set("published", c)}
              label="Published"
              hint={values.published ? "Visible in the Journal" : "Saved as a draft"}
            />
          </div>
          <div className="mt-4 space-y-3">
            <FormMessage state={state} />
            <SubmitButton pending={pending} pendingLabel="Saving…" className="w-full">
              {initial ? "Save post" : values.published ? "Publish post" : "Save draft"}
            </SubmitButton>
            {storeHref && initial?.published && (
              <Link href={storeHref} target="_blank" className="btn btn-ghost btn-sm w-full">
                <ExternalLink size={14} /> View in Journal
              </Link>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg text-ink">Cover</h2>
          <p className="mt-0.5 text-xs text-muted">Journal cards use generative art from these two colours.</p>
          <PostCover palette={palette} className="mt-4 aspect-[16/10]" />
          <p className="mt-3 font-display text-lg leading-snug text-ink">{values.title || "Untitled post"}</p>
          {values.excerpt && <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{values.excerpt}</p>}
          <div className="mt-4">
            <PaletteField name="palette" value={palette} onChange={(next) => set("palette", next.join(","))} />
          </div>
        </section>

        {footer}
      </aside>
    </form>
  );
}
