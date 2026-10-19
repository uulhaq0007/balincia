import type { Metadata } from "next";
import { TrackForm } from "@/components/order/TrackForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ number?: string }> }) {
  const { number } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Order status" title="Track your order" description="Enter your order number and the email or phone number you used at checkout." />
      <div className="container-x mx-auto max-w-4xl pb-10">
        <TrackForm defaultNumber={number} />
      </div>
    </>
  );
}
