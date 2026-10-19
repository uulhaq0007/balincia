"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLES, formToObject, requiredInt, type ActionState } from "@/lib/admin";
import { firstError } from "@/lib/validators";

const pointsSchema = z.object({
  delta: requiredInt("Points", -1_000_000, 1_000_000).refine((v) => v !== 0, "Enter a positive or negative amount"),
});

export async function adjustPoints(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = pointsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const user = await db.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
  if (!user) return { error: "Customer not found." };

  const next = Math.max(0, user.loyaltyPoints + parsed.data.delta);
  await db.user.update({ where: { id: userId }, data: { loyaltyPoints: next } });

  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { ok: true, message: `Balance updated: ${user.loyaltyPoints.toLocaleString()} → ${next.toLocaleString()} points.` };
}

export async function setRole(userId: string, role: string): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsedRole = z.enum(ROLES).safeParse(role);
  if (!parsedRole.success) return { error: "Unknown role." };
  if (userId === admin.id && parsedRole.data !== "ADMIN") return { error: "You can't remove your own admin access." };

  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (!user) return { error: "Customer not found." };
  await db.user.update({ where: { id: userId }, data: { role: parsedRole.data } });

  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return {
    ok: true,
    message:
      parsedRole.data === "ADMIN"
        ? `${user.name} is now an admin. They'll need to sign out and back in to open the admin panel.`
        : `${user.name} no longer has admin access.`,
  };
}
