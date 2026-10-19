"use client";

import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { Field, FormAlert } from "@/components/forms/Field";
import { OrderTimeline } from "./OrderTimeline";
import { formatDate, formatPrice } from "@/lib/format";

type Result = {
  number: string;
  status: string;
  city: string;
  total: number;
  createdAt: string;
  courier: string | null;
  trackingNumber: string | null;
  items: { name: string; variantLabel: string; quantity: number }[];
  events: { status: string; note: string; createdAt: string }[];
};

export function TrackForm({ defaultNumber = "" }: { defaultNumber?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setOrder(null);
      return setError(data.error ?? "Something went wrong");
    }
    setOrder(data.order);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="card grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end md:p-8">
        <Field label="Order number" htmlFor="number">
          <input id="number" name="number" className="input uppercase" placeholder="BLC-XXXXXX" defaultValue={defaultNumber} required />
        </Field>
        <Field label="Email or phone" htmlFor="contact">
          <input id="contact" name="contact" className="input" placeholder="Used at checkout" required />
        </Field>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />} Track
        </button>
      </form>

      {error && (
        <div className="mt-6">
          <FormAlert>{error}</FormAlert>
        </div>
      )}

      {order && (
        <div className="card animate-fade-up mt-8 p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-3xl">{order.number}</p>
            <p className="text-sm text-ink-soft">
              Placed {formatDate(order.createdAt)} · {formatPrice(order.total)} · to {order.city}
            </p>
          </div>
          <div className="mt-8">
            <OrderTimeline status={order.status} events={order.events} courier={order.courier} trackingNumber={order.trackingNumber} />
          </div>
          <ul className="mt-8 space-y-1 border-t border-line pt-6 text-sm text-ink-soft">
            {order.items.map((i, idx) => (
              <li key={idx}>
                {i.quantity} × <span className="text-ink">{i.name}</span> ({i.variantLabel})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
