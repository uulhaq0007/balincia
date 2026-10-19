import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, startSession } from "@/lib/auth";
import { fieldErrors, firstError, registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error), fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in.", fields: { email: "Email already registered" } },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: { name, email, phone: phone || null, passwordHash: await hashPassword(password) },
  });

  // Link any guest orders placed with this email to the new account.
  await db.order.updateMany({ where: { email, userId: null }, data: { userId: user.id } });

  await startSession(user);
  return NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
}
