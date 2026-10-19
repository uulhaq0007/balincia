import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { OrderError, placeOrder } from "@/lib/orders";
import { checkoutSchema, fieldErrors, firstError } from "@/lib/validators";
import { LAST_ORDER_COOKIE } from "@/lib/constants";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error), fields: fieldErrors(parsed.error) }, { status: 400 });
  }

  const session = await getSession();
  try {
    const order = await placeOrder(parsed.data, session?.sub ?? null);
    // Lets a guest view their own confirmation page without exposing orders to anyone with the number.
    const jar = await cookies();
    jar.set(LAST_ORDER_COOKIE, order.number, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ ok: true, number: order.number });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Checkout failed", error);
    return NextResponse.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
  }
}
