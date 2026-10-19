"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SettingKey } from "@/lib/settings";
import { formToObject, optionalText, requiredInt, type ActionState } from "@/lib/admin";
import { whatsappDigits } from "@/lib/contact";
import { firstError } from "@/lib/validators";

const settingsSchema = z.object({
  announcements: z
    .string()
    .default("")
    .transform((v) =>
      v
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(160, "Keep each announcement under 160 characters"))
        .max(10, "Use at most 10 announcements"),
    ),
  freeShippingThreshold: requiredInt("Free shipping threshold", 0, 10_000_000),
  standardShippingFee: requiredInt("Standard shipping fee", 0, 100_000),
  expressShippingFee: requiredInt("Express shipping fee", 0, 100_000),
  pointsPer100: requiredInt("Points per Rs. 100", 0, 100),
  maxPointsRedeemPercent: requiredInt("Max points redemption", 0, 100),
  bankDetails: z.string().trim().max(1000).default(""),
  walletDetails: z.string().trim().max(1000).default(""),
  storeAddress: optionalText(200),
  storeHours: optionalText(100),
  contactPhone: optionalText(30),
  contactEmail: optionalText(120).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid contact email"),
  whatsappNumber: optionalText(30).refine(
    (v) => v === "" || whatsappDigits(v) !== "",
    "Enter a valid WhatsApp number, e.g. 0300-1234567 or +92 300 1234567",
  ),
  whatsappMessage: optionalText(300),
  instagramUrl: socialUrl("Instagram"),
  facebookUrl: socialUrl("Facebook"),
  tiktokUrl: socialUrl("TikTok"),
  youtubeUrl: socialUrl("YouTube"),
});

function socialUrl(label: string) {
  return optionalText(300).refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), `${label} link must start with https://`);
}

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const values: Record<SettingKey, string> = {
    announcements: JSON.stringify(input.announcements),
    freeShippingThreshold: String(input.freeShippingThreshold),
    standardShippingFee: String(input.standardShippingFee),
    expressShippingFee: String(input.expressShippingFee),
    pointsPer100: String(input.pointsPer100),
    maxPointsRedeemPercent: String(input.maxPointsRedeemPercent),
    bankDetails: input.bankDetails,
    walletDetails: input.walletDetails,
    storeAddress: input.storeAddress,
    storeHours: input.storeHours,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    whatsappNumber: input.whatsappNumber,
    whatsappMessage: input.whatsappMessage,
    instagramUrl: input.instagramUrl,
    facebookUrl: input.facebookUrl,
    tiktokUrl: input.tiktokUrl,
    youtubeUrl: input.youtubeUrl,
  };

  await db.$transaction(
    Object.entries(values).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );

  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved — the store is using them now." };
}
