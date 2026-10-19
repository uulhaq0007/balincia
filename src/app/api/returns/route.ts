import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fieldErrors, firstError, returnSchema } from "@/lib/validators";

const RETURN_WINDOW_DAYS = 15;

export async function POST(request: Request) {
  const parsed = returnSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error), fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  const order = await db.order.findUnique({
    where: { number: data.orderNumber },
    include: { events: { where: { status: "DELIVERED" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order || order.email.toLowerCase() !== data.email) {
    return NextResponse.json({ error: "We couldn't match that order number with this email address." }, { status: 404 });
  }
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Returns can be requested once your order has been delivered." }, { status: 400 });
  }
  const deliveredAt = order.events[0]?.createdAt ?? order.updatedAt;
  if (Date.now() - deliveredAt.getTime() > RETURN_WINDOW_DAYS * 86400000) {
    return NextResponse.json({ error: `This order is outside our ${RETURN_WINDOW_DAYS}-day return window.` }, { status: 400 });
  }
  const existing = await db.returnRequest.findFirst({ where: { orderNumber: order.number, status: { in: ["OPEN", "APPROVED"] } } });
  if (existing) {
    return NextResponse.json({ error: "A return request for this order is already being processed." }, { status: 409 });
  }

  await db.returnRequest.create({
    data: {
      orderNumber: order.number,
      email: data.email,
      phone: data.phone || null,
      reason: data.reason,
      resolution: data.resolution,
      details: data.details ?? "",
    },
  });
  return NextResponse.json({ ok: true });
}
