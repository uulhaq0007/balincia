// Pure pricing helpers shared by the checkout UI (estimates) and the
// order API (authoritative totals).

export type ShippingConfig = {
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
};

export type CouponLike = {
  code: string;
  type: string; // PERCENT | FIXED | FREESHIP
  value: number;
  minSubtotal: number;
};

export type ShippingMethod = "STANDARD" | "EXPRESS";

export function couponDiscount(coupon: CouponLike | null | undefined, subtotal: number) {
  if (!coupon || subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === "PERCENT") return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  if (coupon.type === "FIXED") return Math.min(subtotal, coupon.value);
  return 0;
}

export function shippingFee(
  subtotal: number,
  method: ShippingMethod,
  config: ShippingConfig,
  freeShipCoupon = false,
) {
  if (method === "EXPRESS") return config.expressShippingFee;
  if (freeShipCoupon) return 0;
  if (config.freeShippingThreshold > 0 && subtotal >= config.freeShippingThreshold) return 0;
  return config.standardShippingFee;
}

export function maxRedeemablePoints(subtotalAfterDiscount: number, balance: number, maxPercent: number) {
  const cap = Math.floor((subtotalAfterDiscount * maxPercent) / 100);
  return Math.max(0, Math.min(balance, cap));
}

export function computeTotals(input: {
  subtotal: number;
  coupon?: CouponLike | null;
  method: ShippingMethod;
  config: ShippingConfig;
  pointsToRedeem?: number;
}) {
  const discount = couponDiscount(input.coupon, input.subtotal);
  const freeShip = input.coupon?.type === "FREESHIP" && input.subtotal >= (input.coupon?.minSubtotal ?? 0);
  const shipping = shippingFee(input.subtotal, input.method, input.config, freeShip);
  const points = Math.max(0, Math.min(input.pointsToRedeem ?? 0, input.subtotal - discount));
  const total = Math.max(0, input.subtotal - discount - points + shipping);
  return { subtotal: input.subtotal, discount, shipping, points, total };
}

export function pointsEarned(total: number, pointsPer100: number) {
  return Math.floor(total / 100) * pointsPer100;
}

export const LOYALTY_TIERS = [
  { name: "Silver", min: 0, perk: "1 point per Rs. 100 spent" },
  { name: "Gold", min: 25000, perk: "Early access to launches + birthday gift" },
  { name: "Noir", min: 75000, perk: "Free express shipping + private previews" },
] as const;

export function loyaltyTier(lifetimeSpend: number) {
  let tier: (typeof LOYALTY_TIERS)[number] = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) if (lifetimeSpend >= t.min) tier = t;
  const next = LOYALTY_TIERS.find((t) => t.min > lifetimeSpend) ?? null;
  return { tier, next };
}
