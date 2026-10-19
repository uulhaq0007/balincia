import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recomputeProductRating } from "@/lib/catalog";
import { firstError, reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse({ ...body, rating: Number(body?.rating) });
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });

  const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true, slug: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const session = await getSession();
  await db.review.create({
    data: {
      productId: product.id,
      userId: session?.sub ?? null,
      name: parsed.data.name,
      rating: parsed.data.rating,
      title: parsed.data.title ?? "",
      body: parsed.data.body,
    },
  });
  await recomputeProductRating(product.id);
  revalidatePath(`/products/${product.slug}`);

  return NextResponse.json({ ok: true });
}
