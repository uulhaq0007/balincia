import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";

/** GET /api/products?ids=a,b,c — product cards for client-side lists (wishlist). */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 60);
  if (!ids.length) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({ where: { id: { in: ids }, isActive: true }, select: productCardSelect });
  const order = new Map(ids.map((id, i) => [id, i]));
  products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return NextResponse.json({ products });
}
