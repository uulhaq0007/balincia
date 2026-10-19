"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkbox, formToObject, isUniqueViolation, optionalInt, requiredInt, type ActionState } from "@/lib/admin";
import { firstError } from "@/lib/validators";

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "Codes use 3–30 letters, numbers, dashes or underscores"),
    description: z.string().trim().max(200).default(""),
    type: z.enum(["PERCENT", "FIXED", "FREESHIP"]),
    value: optionalInt(0),
    minSubtotal: requiredInt("Minimum subtotal", 0),
    maxUses: optionalInt(1),
    expiresAt: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid expiry date"),
    isActive: checkbox,
  })
  .superRefine((c, ctx) => {
    if (c.type === "PERCENT" && (c.value == null || c.value < 1 || c.value > 100))
      ctx.addIssue({ code: "custom", message: "Percent discounts must be between 1 and 100", path: ["value"] });
    if (c.type === "FIXED" && (c.value == null || c.value < 1))
      ctx.addIssue({ code: "custom", message: "Enter the discount amount in rupees", path: ["value"] });
  });

export async function saveCoupon(couponId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const owner = await db.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
  if (owner && owner.id !== couponId) return { error: `The code ${input.code} already exists.` };

  const data = {
    ...input,
    value: input.type === "FREESHIP" ? 0 : (input.value ?? 0),
    // Codes stay valid through the whole expiry day.
    expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T23:59:59`) : null,
  };

  try {
    if (couponId) await db.coupon.update({ where: { id: couponId }, data });
    else await db.coupon.create({ data });
  } catch (error) {
    if (isUniqueViolation(error)) return { error: `The code ${input.code} already exists.` };
    throw error;
  }

  revalidatePath("/admin/coupons");
  return { ok: true, message: couponId ? "Coupon saved." : `${input.code} created.` };
}

export async function toggleCoupon(couponId: string, isActive: boolean) {
  await requireAdmin();
  if (typeof isActive !== "boolean") return;
  await db.coupon.update({ where: { id: couponId }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(couponId: string): Promise<ActionState> {
  await requireAdmin();
  await db.coupon.deleteMany({ where: { id: couponId } });
  revalidatePath("/admin/coupons");
  return null;
}
