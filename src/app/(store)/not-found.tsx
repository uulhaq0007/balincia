import Link from "next/link";
import { BottleArt } from "@/components/product/BottleArt";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <BottleArt palette={["#2b2118", "#c9a27a"]} shape="attar" bare className="h-48 w-40 opacity-80" />
      <p className="eyebrow mt-6">404</p>
      <h1 className="mt-3 font-display text-5xl">This scent has evaporated</h1>
      <p className="mt-3 max-w-md text-ink-soft">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s find you something lovelier.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">Back home</Link>
        <Link href="/shop" className="btn btn-outline">Shop all</Link>
      </div>
    </div>
  );
}
