"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { OrderError, updateOrderStatus } from "@/lib/orders";
import { formToObject, type ActionState } from "@/lib/admin";
import { firstError } from "@/lib/validators";

const updateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  courier: z.string().trim().max(40).default(""),
  trackingNumber: z.string().trim().max(60).default(""),
  note: z.string().trim().max(500).default(""),
});

export async function updateOrder(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const input = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentStatus: true, courier: true, trackingNumber: true },
  });
  if (!order) return { error: "Order not found." };
  // Re-opening would need stock to be taken again, which updateOrderStatus doesn't do.
  if (order.status === "CANCELLED" && input.status !== "CANCELLED")
    return { error: "Cancelled orders can't be reopened. Ask the customer to place a new order." };

  const nothingChanged =
    input.status === order.status &&
    input.paymentStatus === order.paymentStatus &&
    (input.courier || null) === order.courier &&
    (input.trackingNumber || null) === order.trackingNumber &&
    !input.note;
  if (nothingChanged) return { message: "No changes to save." };

  try {
    await updateOrderStatus(orderId, {
      status: input.status,
      // Only send payment status when changed so COD orders auto-mark PAID on delivery.
      paymentStatus: input.paymentStatus !== order.paymentStatus ? input.paymentStatus : undefined,
      courier: input.courier || null,
      trackingNumber: input.trackingNumber || null,
      note: input.note || undefined,
    });
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, message: "Order updated." };
}
