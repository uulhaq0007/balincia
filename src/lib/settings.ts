import "server-only";
import { cache } from "react";
import { db } from "./db";

export const DEFAULT_SETTINGS = {
  announcements: JSON.stringify([
    "Free nationwide delivery on orders over Rs. 3,000",
    "15-day hassle-free exchanges & returns",
    "Cash on Delivery available across Pakistan",
    "Earn Balincia Points on every order",
  ]),
  freeShippingThreshold: "3000",
  standardShippingFee: "250",
  expressShippingFee: "450",
  pointsPer100: "1",
  maxPointsRedeemPercent: "20",
  bankDetails: "Meezan Bank — Balincia (Pvt) Ltd\nAccount #: 0123-4567890-1\nIBAN: PK00MEZN0001230104567890",
  walletDetails: "JazzCash / Easypaisa: 0300-1234567 (Balincia)",
  storeAddress: "Flagship Atelier, Dolmen Mall Clifton, Karachi",
  storeHours: "Mon – Sun, 11am – 10pm",
  contactPhone: "+92 300 1234567",
  contactEmail: "care@balincia.pk",
  whatsappNumber: "+92 300 1234567",
  whatsappMessage: "Hi Balincia! I'd like some help choosing a fragrance.",
  instagramUrl: "https://instagram.com/",
  facebookUrl: "https://facebook.com/",
  tiktokUrl: "https://tiktok.com/",
  youtubeUrl: "https://youtube.com/",
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export const getSettings = cache(async () => {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  let announcements: string[] = [];
  try {
    announcements = JSON.parse(map.announcements);
  } catch {
    announcements = [];
  }
  return {
    announcements: announcements.filter(Boolean),
    freeShippingThreshold: Number(map.freeShippingThreshold) || 0,
    standardShippingFee: Number(map.standardShippingFee) || 0,
    expressShippingFee: Number(map.expressShippingFee) || 0,
    pointsPer100: Number(map.pointsPer100) || 0,
    maxPointsRedeemPercent: Number(map.maxPointsRedeemPercent) || 0,
    bankDetails: map.bankDetails,
    walletDetails: map.walletDetails,
    storeAddress: map.storeAddress,
    storeHours: map.storeHours,
    contactPhone: map.contactPhone,
    contactEmail: map.contactEmail,
    whatsappNumber: map.whatsappNumber,
    whatsappMessage: map.whatsappMessage,
    instagramUrl: map.instagramUrl,
    facebookUrl: map.facebookUrl,
    tiktokUrl: map.tiktokUrl,
    youtubeUrl: map.youtubeUrl,
  };
});

export type StoreSettings = Awaited<ReturnType<typeof getSettings>>;
