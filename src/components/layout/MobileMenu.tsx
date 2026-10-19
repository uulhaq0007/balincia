"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { NAV } from "@/lib/constants";
import { useScrollLock, useUI } from "@/store/ui";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export function MobileMenu({ user }: { user: { name: string; role: string } | null }) {
  const { menuOpen, setMenuOpen } = useUI();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>("For Him");
  useScrollLock(menuOpen);

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  if (!menuOpen) return null;
  const shop = NAV[0];

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="animate-fade-in absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
      <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-paper-2" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-line">
            {NAV.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3.5 font-display text-xl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-6 mb-2">Shop by</p>
          <div className="divide-y divide-line rounded-2xl border border-line bg-white/50">
            {shop.groups?.map((group) => (
              <div key={group.title}>
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
                  onClick={() => setExpanded(expanded === group.title ? null : group.title)}
                  aria-expanded={expanded === group.title}
                >
                  {group.title}
                  <ChevronDown size={16} className={cn("transition-transform", expanded === group.title && "rotate-180")} />
                </button>
                {expanded === group.title && (
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-2 px-4 pb-4">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-ink-soft">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <Link href="/quiz" className="btn btn-gold mt-6 w-full">
            Take the scent quiz
          </Link>
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            <li>
              <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/login"}>
                {user ? `My account (${user.name.split(" ")[0]})` : "Sign in / Register"}
              </Link>
            </li>
            <li><Link href="/track">Track your order</Link></li>
            <li><Link href="/returns">Returns & exchanges</Link></li>
            <li><Link href="/stores">Store locator</Link></li>
            <li><Link href="/contact">Contact us</Link></li>
            <li><Link href="/blog">The Journal</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
