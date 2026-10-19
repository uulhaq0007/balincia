import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const settings = await getSettings();
  return <CartPageClient freeShippingThreshold={settings.freeShippingThreshold} />;
}
