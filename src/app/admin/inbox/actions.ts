"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { RETURN_STATUSES, type ActionState } from "@/lib/admin";

function refresh() {
  revalidatePath("/admin", "layout");
}

export async function setMessageRead(messageId: string, isRead: boolean) {
  await requireAdmin();
  if (typeof isRead !== "boolean") return;
  await db.contactMessage.updateMany({ where: { id: messageId }, data: { isRead } });
  refresh();
}

export async function deleteMessage(messageId: string): Promise<ActionState> {
  await requireAdmin();
  await db.contactMessage.deleteMany({ where: { id: messageId } });
  refresh();
  return null;
}

export async function setReturnStatus(returnId: string, status: string): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.enum(RETURN_STATUSES).safeParse(status);
  if (!parsed.success) return { error: "Unknown status." };
  await db.returnRequest.updateMany({ where: { id: returnId }, data: { status: parsed.data } });
  refresh();
  return { ok: true };
}

export async function deleteSubscriber(subscriberId: string): Promise<ActionState> {
  await requireAdmin();
  await db.newsletterSubscriber.deleteMany({ where: { id: subscriberId } });
  refresh();
  return null;
}
