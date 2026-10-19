"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { NAV } from "@/lib/constants";
import { useCart, cartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useMounted, useUI } from "@/store/ui";
import { BottleArt } from "@/components/product/BottleArt";
import { cn, parsePalette } from "@/lib/utils";

type Props = { user: { name: string; role: string } | null };

export function HeaderClient({ user }: Props) {
  const pathname = usePathname();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const { setSearchOpen, setMenuOpen } = useUI();
  const [mega, setMega] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMega(null), [pathname]);

  const count = mounted ? cartCount(items) : 0;
  const active = NAV.find((n) => n.label === mega);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled || mega ? "border-line bg-paper/95 backdrop-blur-md" : "border-transparent bg-paper",
      )}
      onMouseLeave={() => setMega(null)}
    >
      <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
        <div className="flex items-center gap-1">
          <button className="btn-ghost -ml-2 rounded-full p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} strokeWidth={1.6} />
          </button>
          <button
            className="btn-ghost hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} strokeWidth={1.6} />
            <span className="hidden xl:inline">Search oud, rose, gifts…</span>
          </button>
          <button className="btn-ghost rounded-full p-2 md:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} strokeWidth={1.6} />
          </button>
        </div>

        <Logo />

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <Link
            href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}
            className="btn-ghost hidden items-center gap-2 rounded-full p-2 text-sm md:flex"
            aria-label="Account"
          >
            <User size={20} strokeWidth={1.6} />
            {user && <span className="hidden max-w-24 truncate font-medium xl:inline">{user.name.split(" ")[0]}</span>}
          </Link>
          <Link href="/wishlist" className="btn-ghost relative rounded-full p-2" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.6} />
            {mounted && wishCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold" aria-label={`${wishCount} saved`} />
            )}
          </Link>
          <button onClick={openCart} className="btn-ghost relative rounded-full p-2" aria-label={`Bag, ${count} items`}>
            <ShoppingBag size={20} strokeWidth={1.6} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[0.62rem] font-bold text-paper">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-line/70 lg:block" aria-label="Main">
        <ul className="container-x flex h-12 items-center justify-center gap-9">
          {NAV.map((item) => (
            <li key={item.label} onMouseEnter={() => setMega(item.groups ? item.label : null)}>
              <Link
                href={item.href}
                className={cn(
                  "link-underline py-1 text-[0.78rem] font-semibold tracking-[0.14em] uppercase transition-colors",
                  pathname.startsWith(item.href) ? "text-gold" : "text-ink hover:text-gold",
                )}
                aria-expanded={item.groups ? mega === item.label : undefined}
                onFocus={() => setMega(item.groups ? item.label : null)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li onMouseEnter={() => setMega(null)}>
            <Link href="/quiz" className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-ink uppercase hover:bg-gold hover:text-white">
              Scent Quiz
            </Link>
          </li>
        </ul>
      </nav>

      {active?.groups && (
        <div className="animate-fade-in absolute inset-x-0 top-full hidden border-b border-line bg-paper shadow-[0_30px_60px_-30px_rgba(22,18,15,0.25)] lg:block">
          <div className="container-x grid grid-cols-[repeat(5,minmax(0,1fr))_1.3fr] gap-8 py-10">
            {active.groups.map((group) => (
              <div key={group.title}>
                <p className="eyebrow mb-4">{group.title}</p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="link-underline text-sm text-ink-soft hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {active.feature && (
              <Link
                href={active.feature.href}
                className="group relative flex overflow-hidden rounded-2xl bg-oud p-6 text-paper"
              >
                <div className="relative z-10 flex flex-col justify-between">
                  <p className="eyebrow text-gold-2">Scent Quiz</p>
                  <div>
                    <p className="font-display text-2xl leading-tight">{active.feature.title}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                      Take the quiz <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
                <BottleArt
                  palette={parsePalette(active.feature.palette)}
                  shape="round"
                  bare
                  className="absolute -right-10 -bottom-6 h-52 w-44 opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
