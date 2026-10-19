import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, fieldErrors, firstError } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error), fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  await db.contactMessage.create({
    data: { ...parsed.data, phone: parsed.data.phone || null, subject: parsed.data.subject ?? "" },
  });
  return NextResponse.json({ ok: true });
}
