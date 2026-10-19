"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { recomputeProductRating } from "@/lib/catalog";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/admin";

async function refresh(productId: string) {
  await recomputeProductRating(productId);
  const product = await db.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/reviews");
}

export async function setReviewApproval(reviewId: string, isApproved: boolean) {
  await requireAdmin();
  if (typeof isApproved !== "boolean") return;
  const review = await db.review.update({ where: { id: reviewId }, data: { isApproved }, select: { productId: true } });
  await refresh(review.productId);
}

export async function deleteReview(reviewId: string): Promise<ActionState> {
  await requireAdmin();
  const review = await db.review.findUnique({ where: { id: reviewId }, select: { productId: true } });
  if (!review) return null;
  await db.review.delete({ where: { id: reviewId } });
  await refresh(review.productId);
  return null;
}
