import "server-only";
import type { Prisma } from "@prisma/client";
import { db, TX_OPTIONS } from "./db";
import { getSettings } from "./settings";
import { computeTotals, maxRedeemablePoints, pointsEarned } from "./pricing";
import type { CheckoutInput } from "./validators";
import { parseImages } from "./utils";

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

type Tx = Prisma.TransactionClient;

export async function findValidCoupon(code: string, subtotal: number, tx: Tx | typeof db = db) {
  const coupon = await tx.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) return { error: "This code isn't valid." } as const;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This code has expired." } as const;
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
    return { error: "This code has reached its usage limit." } as const;
  if (subtotal < coupon.minSubtotal)
    return { error: `Spend Rs. ${coupon.minSubtotal.toLocaleString()} or more to use this code.` } as const;
  return { coupon } as const;
}

export async function placeOrder(input: CheckoutInput, userId: string | null) {
  const settings = await getSettings();

  return db.$transaction(async (tx) => {
    const quantities = new Map<string, number>();
    for (const line of input.items) quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);

    const variants = await tx.variant.findMany({
      where: { id: { in: [...quantities.keys()] } },
      include: { product: true },
    });
    if (variants.length !== quantities.size) throw new OrderError("Some items in your bag are no longer available.");

    let subtotal = 0;
    for (const v of variants) {
      const qty = quantities.get(v.id)!;
      if (!v.product.isActive) throw new OrderError(`${v.product.name} is no longer available.`);
      if (v.stock < qty)
        throw new OrderError(
          v.stock > 0
            ? `Only ${v.stock} left of ${v.product.name} (${v.label}). Please update your bag.`
            : `${v.product.name} (${v.label}) just sold out.`,
        );
      subtotal += v.price * qty;
    }

    let coupon = null;
    if (input.couponCode) {
      const result = await findValidCoupon(input.couponCode, subtotal, tx);
      if ("error" in result) throw new OrderError(result.error ?? "Invalid code");
      coupon = result.coupon;
    }

    let pointsToRedeem = 0;
    const user = userId ? await tx.user.findUnique({ where: { id: userId } }) : null;
    if (input.usePoints && user) {
      const prelim = computeTotals({ subtotal, coupon, method: input.shippingMethod, config: settings });
      pointsToRedeem = maxRedeemablePoints(subtotal - prelim.discount, user.loyaltyPoints, settings.maxPointsRedeemPercent);
    }

    const totals = computeTotals({
      subtotal,
      coupon,
      method: input.shippingMethod,
      config: settings,
      pointsToRedeem,
    });

    let number = `BLC-${randomCode(6)}`;
    while (await tx.order.findUnique({ where: { number } })) number = `BLC-${randomCode(6)}`;

    const order = await tx.order.create({
      data: {
        number,
        userId: user?.id ?? null,
        email: input.email,
        phone: input.phone,
        fullName: input.fullName,
        line1: input.line1,
        line2: input.line2 || null,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode || null,
        notes: input.notes || null,
        isGift: input.isGift,
        giftMessage: input.isGift ? input.giftMessage || null : null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        pointsRedeemed: totals.points,
        shippingFee: totals.shipping,
        total: totals.total,
        couponCode: coupon?.code ?? null,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        items: {
          create: variants.map((v) => ({
            productId: v.productId,
            variantId: v.id,
            name: v.product.name,
            variantLabel: v.label,
            slug: v.product.slug,
            palette: v.product.palette,
            bottleShape: v.product.bottleShape,
            image: parseImages(v.product.images)[0] ?? null,
            price: v.price,
            quantity: quantities.get(v.id)!,
          })),
        },
        events: { create: { status: "PENDING", note: "Order placed" } },
      },
    });

    for (const v of variants) {
      const qty = quantities.get(v.id)!;
      const res = await tx.variant.updateMany({
        where: { id: v.id, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (res.count === 0) throw new OrderError(`${v.product.name} (${v.label}) just sold out.`);
      await tx.product.update({ where: { id: v.productId }, data: { soldCount: { increment: qty } } });
    }

    if (coupon) await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    if (user && totals.points > 0)
      await tx.user.update({ where: { id: user.id }, data: { loyaltyPoints: { decrement: totals.points } } });

    if (user && input.saveAddress) {
      const existing = await tx.address.count({ where: { userId: user.id } });
      await tx.address.create({
        data: {
          userId: user.id,
          fullName: input.fullName,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2 || null,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode || null,
          isDefault: existing === 0,
        },
      });
    }

    return order;
  }, TX_OPTIONS);
}

export async function updateOrderStatus(
  orderId: string,
  update: { status?: string; paymentStatus?: string; courier?: string | null; trackingNumber?: string | null; note?: string },
) {
  const settings = await getSettings();
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new OrderError("Order not found", 404);

    const data: Prisma.OrderUpdateInput = {};
    const nextStatus = update.status && update.status !== order.status ? update.status : null;

    if (update.paymentStatus) data.paymentStatus = update.paymentStatus;
    if (update.courier !== undefined) data.courier = update.courier || null;
    if (update.trackingNumber !== undefined) data.trackingNumber = update.trackingNumber || null;

    if (nextStatus) {
      data.status = nextStatus;

      if (nextStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          if (item.variantId)
            await tx.variant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          if (item.productId)
            await tx.product.updateMany({
              where: { id: item.productId },
              data: { soldCount: { decrement: item.quantity } },
            });
        }
        if (order.userId && order.pointsRedeemed > 0)
          await tx.user.update({
            where: { id: order.userId },
            data: { loyaltyPoints: { increment: order.pointsRedeemed } },
          });
      }

      if (nextStatus === "DELIVERED") {
        if (order.paymentMethod === "COD" && !update.paymentStatus) data.paymentStatus = "PAID";
        if (order.userId && !order.pointsAwarded) {
          await tx.user.update({
            where: { id: order.userId },
            data: { loyaltyPoints: { increment: pointsEarned(order.total, settings.pointsPer100) } },
          });
          data.pointsAwarded = true;
        }
      }
    }

    const shouldLog = nextStatus || update.note || update.trackingNumber !== undefined;
    if (shouldLog) {
      const status = nextStatus ?? order.status;
      const trackingNote =
        update.trackingNumber && update.trackingNumber !== order.trackingNumber
          ? `Tracking: ${update.courier ? `${update.courier} ` : ""}${update.trackingNumber}`
          : "";
      const note = [update.note, trackingNote].filter(Boolean).join(" · ");
      if (nextStatus || note) data.events = { create: { status, note } };
    }

    return tx.order.update({ where: { id: orderId }, data });
  }, TX_OPTIONS);
}
