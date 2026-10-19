import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { firstError, newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });

  const existing = await db.newsletterSubscriber.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ message: "You're already subscribed — thank you!" });

  await db.newsletterSubscriber.create({ data: { email: parsed.data.email } });
  return NextResponse.json({ message: "Welcome to the inner circle. Use WELCOME10 for 10% off." });
}
