import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { topNotes: { contains: q, mode: "insensitive" } },
        { heartNotes: { contains: q, mode: "insensitive" } },
        { baseNotes: { contains: q, mode: "insensitive" } },
        { families: { contains: q.toLowerCase() } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    orderBy: [{ soldCount: "desc" }],
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      price: true,
      compareAtPrice: true,
      images: true,
      palette: true,
      bottleShape: true,
    },
  });

  return NextResponse.json({ products });
}
