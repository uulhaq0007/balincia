import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex flex-col items-center leading-none", className)} aria-label="Balincia home">
      <span
        className={cn(
          "font-display text-[1.65rem] font-medium tracking-[0.28em] md:text-[1.9rem]",
          light ? "text-paper" : "text-ink",
        )}
      >
        BALINCIA
      </span>
      <span className={cn("mt-1 text-[0.55rem] font-bold tracking-[0.42em] uppercase", light ? "text-gold-2" : "text-gold")}>
        Maison de Parfum
      </span>
    </Link>
  );
}
