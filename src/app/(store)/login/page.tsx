import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/AuthForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getSession } from "@/lib/auth";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const session = await getSession();
  if (session && (!next?.startsWith("/admin") || session.role === "ADMIN")) {
    redirect(next ?? (session.role === "ADMIN" ? "/admin" : "/account"));
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to track orders, manage your wishlist and redeem points.">
      <AuthForm mode="login" next={next} />
      <div className="mt-8 rounded-xl border border-dashed border-line p-4 text-xs text-ink-soft">
        <p className="font-semibold text-ink">Demo accounts</p>
        <p className="mt-1">Customer — ayesha@example.com / Customer@123</p>
        <p>Admin — admin@balincia.pk / Admin@12345</p>
      </div>
    </AuthShell>
  );
}
