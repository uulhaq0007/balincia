import { NextResponse } from "next/server";
import { z } from "zod";
import { findValidCoupon } from "@/lib/orders";

const schema = z.object({
  code: z.string().trim().min(1, "Enter a code").max(40),
  subtotal: z.number().int().min(0),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid code" }, { status: 400 });

  const result = await findValidCoupon(parsed.data.code, parsed.data.subtotal);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { code, type, value, minSubtotal, description } = result.coupon;
  return NextResponse.json({ coupon: { code, type, value, minSubtotal, description } });
}
