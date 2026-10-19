import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { firstError, trackSchema } from "@/lib/validators";

const digits = (s: string) => s.replace(/\D/g, "").slice(-10);

export async function POST(request: Request) {
  const parsed = trackSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });

  const { number, contact } = parsed.data;
  const order = await db.order.findUnique({
    where: { number },
    include: {
      items: { select: { name: true, variantLabel: true, quantity: true } },
      events: { orderBy: { createdAt: "asc" }, select: { status: true, note: true, createdAt: true } },
    },
  });

  const matches =
    order &&
    (order.email.toLowerCase() === contact.toLowerCase() || (digits(contact).length >= 10 && digits(order.phone) === digits(contact)));

  if (!matches) {
    return NextResponse.json({ error: "We couldn't find an order with those details. Check the number and the email/phone used at checkout." }, { status: 404 });
  }

  // Deliberately limited: no street address or contact details in tracking responses.
  return NextResponse.json({
    order: {
      number: order.number,
      status: order.status,
      city: order.city,
      total: order.total,
      createdAt: order.createdAt,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      items: order.items,
      events: order.events,
    },
  });
}
