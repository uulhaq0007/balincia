import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/AuthForm";
import { AuthShell } from "@/components/layout/AuthShell";
import { getSession } from "@/lib/auth";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next ?? "/account");

  return (
    <AuthShell title="Join the circle" subtitle="Create an account in seconds — earn points from your very first order.">
      <AuthForm mode="register" next={next} />
    </AuthShell>
  );
}
