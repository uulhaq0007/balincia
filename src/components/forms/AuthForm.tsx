"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Field, FormAlert } from "./Field";
import { safeNext } from "@/lib/utils";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFields({});
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setFields(data.fields ?? {});
      setLoading(false);
      return;
    }
    const fallback = data.user?.role === "ADMIN" ? "/admin" : "/account";
    router.replace(safeNext(next) ?? fallback);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && <FormAlert>{error}</FormAlert>}
      {mode === "register" && (
        <Field label="Full name" htmlFor="name" error={fields.name}>
          <input id="name" name="name" className="input" autoComplete="name" required aria-invalid={!!fields.name} />
        </Field>
      )}
      <Field label="Email" htmlFor="email" error={fields.email}>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required aria-invalid={!!fields.email} />
      </Field>
      {mode === "register" && (
        <Field label="Phone (optional)" htmlFor="phone" error={fields.phone} hint="For delivery updates via SMS / WhatsApp">
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="03xx-xxxxxxx" aria-invalid={!!fields.phone} />
        </Field>
      )}
      <Field
        label="Password"
        htmlFor="password"
        error={fields.password}
        hint={mode === "register" ? "At least 8 characters" : undefined}
      >
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="input pr-12"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            aria-invalid={!!fields.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading && <LoaderCircle size={16} className="animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New to Balincia?{" "}
            <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
