import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const addresses = user
    ? await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }] })
    : [];

  return (
    <CheckoutClient
      config={{
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingFee: settings.standardShippingFee,
        expressShippingFee: settings.expressShippingFee,
        maxPointsRedeemPercent: settings.maxPointsRedeemPercent,
        pointsPer100: settings.pointsPer100,
      }}
      user={user ? { name: user.name, email: user.email, phone: user.phone ?? "", loyaltyPoints: user.loyaltyPoints } : null}
      addresses={addresses.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? "",
        city: a.city,
        province: a.province,
        postalCode: a.postalCode ?? "",
      }))}
    />
  );
}
