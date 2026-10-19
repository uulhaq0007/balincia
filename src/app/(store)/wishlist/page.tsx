import type { Metadata } from "next";
import { WishlistClient } from "@/components/product/WishlistClient";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistClient />;
}
