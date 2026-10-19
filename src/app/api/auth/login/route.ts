import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startSession, verifyPassword } from "@/lib/auth";
import { firstError, loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await startSession(user);
  return NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
}
