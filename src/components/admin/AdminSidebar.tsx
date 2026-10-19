"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: LucideIcon; badgeKey?: "orders" | "inbox" };

const NAV: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badgeKey: "orders" },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox" },
  { href: "/admin/blog", label: "Journal", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type Props = {
  adminName: string;
  badges: { orders: number; inbox: number };
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <Link href="/admin" className="inline-flex flex-col leading-none">
      <span className="font-display text-xl font-medium tracking-[0.28em] text-paper">BALINCIA</span>
      <span className="mt-1.5 text-[0.55rem] font-bold uppercase tracking-[0.42em] text-gold-2">Admin</span>
    </Link>
  );
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg text-sm text-paper/70 transition hover:text-paper disabled:opacity-60",
        compact ? "p-2" : "px-3 py-2 hover:bg-white/5",
      )}
      aria-label="Sign out"
    >
      {pending ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
      {!compact && "Sign out"}
    </button>
  );
}

export function AdminSidebar({ adminName, badges }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-oud text-paper lg:flex print:hidden">
        <div className="px-6 pb-6 pt-8">
          <Wordmark />
        </div>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Admin">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const badge = item.badgeKey ? badges[item.badgeKey] : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                      active ? "bg-paper/10 font-semibold text-paper" : "text-paper/65 hover:bg-white/5 hover:text-paper",
                    )}
                  >
                    <item.icon size={17} strokeWidth={active ? 2 : 1.6} className={active ? "text-gold-2" : undefined} />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="rounded-full bg-gold px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white tabular-nums">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          <p className="px-3 pb-2 text-xs text-paper/50">
            Signed in as <span className="font-semibold text-paper/80">{adminName}</span>
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-paper/70 transition hover:bg-white/5 hover:text-paper"
          >
            <ExternalLink size={16} /> View store
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 bg-oud text-paper lg:hidden print:hidden">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <Wordmark />
          <div className="flex items-center gap-1">
            <Link href="/" className="p-2 text-paper/70 hover:text-paper" aria-label="View store">
              <ExternalLink size={16} />
            </Link>
            <SignOutButton compact />
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Admin">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active ? "bg-paper text-ink" : "text-paper/70 hover:text-paper",
                )}
              >
                <item.icon size={14} />
                {item.label}
                {badge > 0 && (
                  <span className="rounded-full bg-gold px-1.5 text-[0.6rem] leading-4 text-white tabular-nums">{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
