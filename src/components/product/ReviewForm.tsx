"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Star } from "lucide-react";
import { Field, FormAlert } from "@/components/forms/Field";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, defaultName }: { productId: string; defaultName?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done) return <FormAlert tone="success">Thank you! Your review has been published.</FormAlert>;
  if (!open)
    return (
      <button className="btn btn-outline" onClick={() => setOpen(true)}>
        Write a review
      </button>
    );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, productId, rating }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Could not submit your review");
    setDone(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <p className="font-display text-2xl">Share your thoughts</p>
      {error && <FormAlert>{error}</FormAlert>}
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
            >
              <Star size={28} strokeWidth={1.2} className={cn("text-gold transition-transform hover:scale-110", i <= (hover || rating) && "fill-gold")} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="rv-name">
          <input id="rv-name" name="name" className="input" defaultValue={defaultName} required minLength={2} />
        </Field>
        <Field label="Headline (optional)" htmlFor="rv-title">
          <input id="rv-title" name="title" className="input" placeholder="Sum it up" maxLength={100} />
        </Field>
      </div>
      <Field label="Review" htmlFor="rv-body">
        <textarea id="rv-body" name="body" className="input" required minLength={10} placeholder="How does it smell? How long does it last on you?" />
      </Field>
      <div className="flex gap-3">
        <button className="btn btn-primary" disabled={loading}>
          {loading && <LoaderCircle size={16} className="animate-spin" />} Submit review
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
