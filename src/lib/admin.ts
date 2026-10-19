// Shared helpers for the admin panel. Kept free of server-only imports so
// client components can use the constants too.
import { z } from "zod";

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** IDs of rows saved by the action, in submission order (e.g. product variants). */
  ids?: string[];
} | null;

export const ADMIN_PAGE_SIZE = 20;

export const COURIERS = ["TCS", "Leopards", "M&P", "PostEx", "Trax", "Other"] as const;

export const COUPON_TYPES = [
  { value: "PERCENT", label: "Percent off" },
  { value: "FIXED", label: "Fixed amount" },
  { value: "FREESHIP", label: "Free shipping" },
] as const;

export const RETURN_STATUSES = ["OPEN", "APPROVED", "REJECTED", "COMPLETED"] as const;

export const MESSAGE_TYPES = ["CONTACT", "CORPORATE", "REQUEST"] as const;

export const ROLES = ["CUSTOMER", "ADMIN"] as const;

export const PILL_TONES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-800",
  violet: "bg-violet-100 text-violet-800",
  indigo: "bg-indigo-100 text-indigo-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  stone: "bg-stone-200 text-stone-700",
  gold: "bg-gold-soft text-ink-2",
};

export const DOT_TONES: Record<string, string> = {
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  stone: "bg-stone-400",
};

export const PAYMENT_STATUS_TONE: Record<string, string> = { PENDING: "amber", PAID: "emerald", REFUNDED: "stone" };
export const RETURN_STATUS_TONE: Record<string, string> = {
  OPEN: "amber",
  APPROVED: "sky",
  REJECTED: "rose",
  COMPLETED: "emerald",
};
export const MESSAGE_TYPE_TONE: Record<string, string> = { CONTACT: "stone", CORPORATE: "indigo", REQUEST: "violet" };

type SearchParams = Record<string, string | string[] | undefined>;

export function readParam(sp: SearchParams, key: string) {
  const value = sp[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export function readPage(sp: SearchParams) {
  const page = Number(readParam(sp, "page"));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function pageCount(total: number, size = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / size));
}

/** Build a query string from params, dropping empty values. */
export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
  }
  const out = qs.toString();
  return out ? `?${out}` : "";
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(days: number, from = new Date()) {
  const d = startOfDay(from);
  d.setDate(d.getDate() - days);
  return d;
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function csvCell(value: unknown) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// ---- zod helpers for FormData -------------------------------------------

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid colour");

/** HTML checkboxes submit "on" when ticked and nothing otherwise. */
export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const optionalText = (max: number) => z.string().trim().max(max).default("");

/** Integer from a text/number input; empty string becomes null. */
export const optionalInt = (min = 0) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number({ error: "Enter a whole number" }).int("Enter a whole number").min(min).nullable(),
  );

export const requiredInt = (label: string, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ error: `${label} is required` })
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be at least ${min}`)
      .max(max, `${label} must be at most ${max}`),
  );

export function formToObject(formData: FormData) {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("$ACTION")) out[key] = value;
  }
  return out;
}

/** Thrown inside admin transactions to abort with a message safe to show the admin. */
export class AdminError extends Error {}

/** Accepts absolute http(s) URLs and site-relative paths such as /media/… */
export function isImageUrl(value: string) {
  return /^(https?:\/\/[^\s]+|\/[^\s/][^\s]*)$/.test(value);
}

export function suggestSku(slug: string, label: string) {
  const size = label.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `BLC-${slug.slice(0, 10).replace(/-+$/, "").toUpperCase()}${size ? `-${size}` : ""}`;
}
