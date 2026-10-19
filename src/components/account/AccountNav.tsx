"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutGrid, LogOut, MapPin, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", Icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", Icon: Package },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin },
  { href: "/account/settings", label: "Settings", Icon: Settings },
  { href: "/wishlist", label: "Wishlist", Icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-xl",
              active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2 hover:text-ink",
            )}
          >
            <Icon size={17} strokeWidth={1.7} /> {label}
          </Link>
        );
      })}
      <button
        onClick={signOut}
        className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-2 hover:text-sale lg:mt-4 lg:rounded-xl"
      >
        <LogOut size={17} strokeWidth={1.7} /> Sign out
      </button>
    </nav>
  );
}
