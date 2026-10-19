"use client";

import { useState } from "react";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { FormAlert } from "./Field";

type Props = {
  endpoint: string;
  submitLabel: string;
  success: { title: string; body: string };
  children: (errors: Record<string, string>) => React.ReactNode;
  className?: string;
};

/** Posts the form as JSON to an API route and swaps in a success panel. */
export function ApiForm({ endpoint, submitLabel, success, children, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrors({});
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setErrors(data.fields ?? {});
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card animate-fade-up flex flex-col items-center p-10 text-center">
        <CircleCheck size={40} strokeWidth={1.4} className="text-sage" />
        <p className="mt-4 font-display text-3xl">{success.title}</p>
        <p className="mt-2 max-w-md text-ink-soft">{success.body}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className ?? "card space-y-5 p-6 md:p-8"} noValidate>
      {error && <FormAlert>{error}</FormAlert>}
      {children(errors)}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <LoaderCircle size={16} className="animate-spin" />} {submitLabel}
      </button>
    </form>
  );
}
