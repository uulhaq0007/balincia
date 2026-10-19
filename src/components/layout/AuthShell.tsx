import { BottleArt } from "@/components/product/BottleArt";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-x grid gap-10 py-12 md:py-20 lg:grid-cols-2 lg:gap-16">
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-oud p-10 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="relative z-10">
          <p className="eyebrow text-gold-2">Balincia Circle</p>
          <p className="mt-4 max-w-sm font-display text-4xl leading-tight">
            Members earn points on every bottle, get early access to launches, and track orders in one place.
          </p>
        </div>
        <ul className="relative z-10 space-y-2 text-sm text-paper/70">
          <li>— 1 point for every Rs. 100 spent</li>
          <li>— Redeem points at checkout</li>
          <li>— Saved addresses for faster checkout</li>
        </ul>
        <BottleArt palette={["#3b1d12", "#d08a4a"]} shape="round" bare className="animate-float absolute -right-16 bottom-0 h-[26rem] w-[22rem] opacity-90" />
      </div>
      <div className="mx-auto w-full max-w-md py-4">
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 mb-8 text-ink-soft">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
