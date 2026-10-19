"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gift, LoaderCircle, Lock, Sparkles, Tag, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { useMounted } from "@/store/ui";
import { CITIES, PAYMENT_METHODS, PROVINCES } from "@/lib/constants";
import { computeTotals, maxRedeemablePoints, pointsEarned, type CouponLike, type ShippingMethod } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { Field, FormAlert } from "@/components/forms/Field";
import { cn } from "@/lib/utils";

type Address = { id: string; fullName: string; phone: string; line1: string; line2: string; city: string; province: string; postalCode: string };
type Props = {
  config: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    expressShippingFee: number;
    maxPointsRedeemPercent: number;
    pointsPer100: number;
  };
  user: { name: string; email: string; phone: string; loyaltyPoints: number } | null;
  addresses: Address[];
};

type Form = {
  email: string;
  phone: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  giftMessage: string;
};

export function CheckoutClient({ config, user, addresses }: Props) {
  const router = useRouter();
  const mounted = useMounted();
  const { items, clear } = useCart();
  const defaultAddress = addresses[0];

  const [form, setForm] = useState<Form>({
    email: user?.email ?? "",
    phone: defaultAddress?.phone ?? user?.phone ?? "",
    fullName: defaultAddress?.fullName ?? user?.name ?? "",
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? "",
    province: defaultAddress?.province ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
    notes: "",
    giftMessage: "",
  });
  const [addressId, setAddressId] = useState<string | null>(defaultAddress?.id ?? null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("COD");
  const [isGift, setIsGift] = useState(false);
  const [saveAddress, setSaveAddress] = useState(!!user && addresses.length === 0);
  const [usePoints, setUsePoints] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<(CouponLike & { description?: string }) | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!mounted) return <div className="container-x min-h-[60vh] py-16" />;

  if (placed) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LoaderCircle className="animate-spin text-gold" size={32} />
        <p className="font-display text-2xl">Confirming your order…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-[55vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-ink-soft">Add a scent or two before checking out.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Browse the library</Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const prelim = computeTotals({ subtotal, coupon, method: shippingMethod, config });
  const redeemable = user ? maxRedeemablePoints(subtotal - prelim.discount, user.loyaltyPoints, config.maxPointsRedeemPercent) : 0;
  const totals = computeTotals({ subtotal, coupon, method: shippingMethod, config, pointsToRedeem: usePoints ? redeemable : 0 });
  const couponBelowMin = coupon && subtotal < coupon.minSubtotal;

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (["fullName", "phone", "line1", "line2", "city", "province", "postalCode"].includes(key)) setAddressId(null);
  };

  const chooseAddress = (a: Address) => {
    setAddressId(a.id);
    setForm((f) => ({ ...f, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, province: a.province, postalCode: a.postalCode }));
  };

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = await res.json().catch(() => ({}));
    setCouponLoading(false);
    if (!res.ok) return setCouponError(data.error ?? "Invalid code");
    setCoupon(data.coupon);
    setCouponInput("");
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        isGift,
        shippingMethod,
        paymentMethod,
        couponCode: coupon?.code ?? "",
        usePoints: usePoints && redeemable > 0,
        saveAddress: !!user && saveAddress && !addressId,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSubmitting(false);
      setErrors(data.fields ?? {});
      setFormError(data.error ?? "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPlaced(true);
    router.push(`/order/${data.number}`);
    clear();
  }

  return (
    <div className="container-x py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-2 font-display text-5xl">Almost yours</h1>
        </div>
        {!user && (
          <p className="text-sm text-ink-soft">
            Have an account?{" "}
            <Link href="/login?next=/checkout" className="font-semibold text-ink underline underline-offset-4">
              Sign in
            </Link>{" "}
            to earn points.
          </p>
        )}
      </div>

      <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]" noValidate>
        <div className="space-y-10">
          {formError && <FormAlert>{formError}</FormAlert>}

          <Section step={1} title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={errors.email}>
                <input id="email" type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" required aria-invalid={!!errors.email} />
              </Field>
              <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="For delivery updates on WhatsApp">
                <input id="phone" type="tel" className="input" value={form.phone} onChange={set("phone")} placeholder="03xx-xxxxxxx" autoComplete="tel" required aria-invalid={!!errors.phone} />
              </Field>
            </div>
          </Section>

          <Section step={2} title="Delivery address">
            {addresses.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => chooseAddress(a)}
                    className={cn(
                      "rounded-2xl border p-4 text-left text-sm transition-colors",
                      addressId === a.id ? "border-ink bg-white" : "border-line hover:border-ink-soft",
                    )}
                  >
                    <p className="font-semibold">{a.fullName}</p>
                    <p className="text-ink-soft">{a.line1}</p>
                    <p className="text-ink-soft">
                      {a.city}, {a.province}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" error={errors.fullName} className="sm:col-span-2">
                <input id="fullName" className="input" value={form.fullName} onChange={set("fullName")} autoComplete="name" required aria-invalid={!!errors.fullName} />
              </Field>
              <Field label="Street address" htmlFor="line1" error={errors.line1} className="sm:col-span-2">
                <input id="line1" className="input" value={form.line1} onChange={set("line1")} placeholder="House #, street, block / phase, area" autoComplete="address-line1" required aria-invalid={!!errors.line1} />
              </Field>
              <Field label="Apartment, landmark (optional)" htmlFor="line2" className="sm:col-span-2">
                <input id="line2" className="input" value={form.line2} onChange={set("line2")} autoComplete="address-line2" />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <input id="city" className="input" list="cities" value={form.city} onChange={set("city")} autoComplete="address-level2" required aria-invalid={!!errors.city} />
                <datalist id="cities">
                  {CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Province" htmlFor="province" error={errors.province}>
                <select id="province" className="input" value={form.province} onChange={set("province")} required aria-invalid={!!errors.province}>
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Postal code (optional)" htmlFor="postalCode">
                <input id="postalCode" className="input" value={form.postalCode} onChange={set("postalCode")} autoComplete="postal-code" inputMode="numeric" />
              </Field>
            </div>
            {user && !addressId && (
              <label className="mt-4 flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-[#16120f]" />
                Save this address to my account
              </label>
            )}
          </Section>

          <Section step={3} title="Delivery speed">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "STANDARD",
                    title: "Standard",
                    eta: "2–4 working days",
                    fee: subtotal >= config.freeShippingThreshold || coupon?.type === "FREESHIP" ? 0 : config.standardShippingFee,
                  },
                  { value: "EXPRESS", title: "Express", eta: "24–48 hrs in major cities", fee: config.expressShippingFee },
                ] as const
              ).map((opt) => (
                <RadioCard key={opt.value} checked={shippingMethod === opt.value} onSelect={() => setShippingMethod(opt.value)} name="shipping">
                  <div className="flex w-full items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{opt.title}</p>
                      <p className="text-xs text-ink-soft">{opt.eta}</p>
                    </div>
                    <p className="text-sm font-semibold">{opt.fee === 0 ? "Free" : formatPrice(opt.fee)}</p>
                  </div>
                </RadioCard>
              ))}
            </div>
          </Section>

          <Section step={4} title="Payment">
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <RadioCard key={m.value} checked={paymentMethod === m.value} onSelect={() => setPaymentMethod(m.value)} name="payment">
                  <div>
                    <p className="font-semibold">{m.label}</p>
                    <p className="text-xs text-ink-soft">{m.description}</p>
                  </div>
                </RadioCard>
              ))}
            </div>
          </Section>

          <Section step={5} title="Finishing touches">
            <label className="flex items-center gap-3 rounded-2xl border border-line p-4">
              <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="h-4 w-4 accent-[#16120f]" />
              <Gift size={18} className="text-gold" />
              <span className="text-sm">
                <strong>This is a gift</strong> — we&apos;ll gift-wrap it, hide the price and add your note (free)
              </span>
            </label>
            {isGift && (
              <Field label="Gift message" htmlFor="giftMessage" className="mt-4" hint="Up to 300 characters, handwritten on a card">
                <textarea id="giftMessage" className="input min-h-24" maxLength={300} value={form.giftMessage} onChange={set("giftMessage")} />
              </Field>
            )}
            <Field label="Order notes (optional)" htmlFor="notes" className="mt-4">
              <textarea id="notes" className="input min-h-20" maxLength={500} value={form.notes} onChange={set("notes")} placeholder="Delivery instructions, preferred time…" />
            </Field>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="card p-6">
            <p className="font-display text-2xl">Order summary</p>
            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.variantId} className="flex items-center gap-3">
                  <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                    <ProductImage product={i} />
                    <span className="absolute -top-0 -right-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-ink px-1 text-[0.65rem] font-bold text-paper">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[1.05rem]">{i.name}</p>
                    <p className="text-xs text-muted">{i.variantLabel}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-line pt-5">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage">
                  <span className="flex items-center gap-2">
                    <Tag size={15} /> <strong>{coupon.code}</strong>
                    {coupon.description && <span className="hidden text-xs sm:inline">· {coupon.description}</span>}
                  </span>
                  <button type="button" onClick={() => setCoupon(null)} aria-label="Remove code">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="input h-11 uppercase"
                    placeholder="Discount code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    aria-label="Discount code"
                  />
                  <button type="button" onClick={applyCoupon} className="btn btn-outline btn-sm h-11" disabled={couponLoading}>
                    {couponLoading ? <LoaderCircle size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-sale">{couponError}</p>}
              {couponBelowMin && (
                <p className="mt-2 text-xs text-sale">Add {formatPrice(coupon!.minSubtotal - subtotal)} more to use this code.</p>
              )}
              {!coupon && !couponError && <p className="mt-2 text-xs text-muted">Try WELCOME10 for 10% off orders over Rs. 2,000.</p>}
            </div>

            {user && user.loyaltyPoints > 0 && (
              <label className="mt-4 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold-soft/40 px-4 py-3 text-sm">
                <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} disabled={redeemable === 0} className="h-4 w-4 accent-[#a97c48]" />
                <Sparkles size={16} className="text-gold" />
                <span>
                  Use <strong>{redeemable.toLocaleString()}</strong> of your {user.loyaltyPoints.toLocaleString()} points
                  <span className="block text-xs text-ink-soft">1 point = Rs. 1 · up to {config.maxPointsRedeemPercent}% of your order</span>
                </span>
              </label>
            )}

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && <Row label={`Discount (${coupon?.code})`} value={`− ${formatPrice(totals.discount)}`} accent />}
              {totals.points > 0 && <Row label="Points redeemed" value={`− ${formatPrice(totals.points)}`} accent />}
              <Row label={`Shipping (${shippingMethod === "EXPRESS" ? "Express" : "Standard"})`} value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)} />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm font-bold tracking-wider uppercase">Total</span>
              <span className="font-display text-3xl tabular-nums">{formatPrice(totals.total)}</span>
            </div>
            {user && config.pointsPer100 > 0 && (
              <p className="mt-1 text-right text-xs text-gold">You&apos;ll earn {pointsEarned(totals.total, config.pointsPer100)} points on delivery</p>
            )}

            <button type="submit" className="btn btn-primary mt-6 w-full" disabled={submitting}>
              {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Lock size={15} />}
              {paymentMethod === "COD" ? "Place order — pay on delivery" : `Place order · ${formatPrice(totals.total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              By placing your order you agree to our <Link href="/policies/terms" className="underline">terms</Link> and{" "}
              <Link href="/policies/returns" className="underline">return policy</Link>.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 font-display text-2xl">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-sans text-sm font-bold text-paper">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function RadioCard({ checked, onSelect, name, children }: { checked: boolean; onSelect: () => void; name: string; children: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors", checked ? "border-ink bg-white" : "border-line hover:border-ink-soft")}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="mt-1 h-4 w-4 accent-[#16120f]" />
      {children}
    </label>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("flex justify-between", accent && "text-sage")}>
      <dt className={accent ? "" : "text-ink-soft"}>{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
