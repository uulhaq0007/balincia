"use client";

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("done");
      setMessage(data.message ?? "You're on the list!");
      setEmail("");
    } else {
      setState("error");
      setMessage(data.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={cn(
          "flex h-13 items-center rounded-full border pr-1.5 pl-5 transition-colors",
          dark ? "border-paper/25 bg-paper/5 focus-within:border-paper/60" : "border-line bg-white focus-within:border-ink-soft",
        )}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className={cn("h-full w-full bg-transparent text-sm outline-none", dark ? "placeholder:text-paper/50" : "placeholder:text-muted")}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
            dark ? "bg-paper text-ink hover:bg-gold-soft" : "bg-ink text-paper hover:bg-ink-2",
          )}
          aria-label="Subscribe"
        >
          {state === "loading" ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : state === "done" ? (
            <Check size={16} />
          ) : (
            <ArrowRight size={16} />
          )}
        </button>
      </div>
      {message && (
        <p className={cn("mt-2 pl-5 text-xs", state === "error" ? "text-sale" : dark ? "text-gold-2" : "text-sage")} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
