"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireUser, startSession, verifyPassword } from "@/lib/auth";
import { firstError } from "@/lib/validators";

export type ActionState = { ok?: boolean; error?: string; message?: string };

const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function updateProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });
  await startSession(updated); // refresh the name stored in the session token
  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile updated" };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "New password must be at least 8 characters").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export async function changePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.current, record.passwordHash))) return { error: "Current password is incorrect" };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  return { ok: true, message: "Password changed" };
}

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  line1: z.string().trim().min(5, "Enter a complete street address").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter a city").max(60),
  province: z.string().trim().min(2, "Select a province").max(60),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
});

export async function addAddress(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const count = await db.address.count({ where: { userId: user.id } });
  if (count >= 10) return { error: "You can save up to 10 addresses" };
  await db.address.create({
    data: {
      ...parsed.data,
      line2: parsed.data.line2 || null,
      postalCode: parsed.data.postalCode || null,
      userId: user.id,
      isDefault: count === 0,
    },
  });
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved" };
}

export async function deleteAddress(id: string) {
  const user = await requireUser();
  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return;
  await db.address.delete({ where: { id } });
  if (address.isDefault) {
    const next = await db.address.findFirst({ where: { userId: user.id } });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const user = await requireUser();
  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
