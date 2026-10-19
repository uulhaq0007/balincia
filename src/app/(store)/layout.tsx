import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { HeaderClient } from "@/components/layout/HeaderClient";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  const user = session ? { name: session.name, role: session.role } : null;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <AnnouncementBar messages={settings.announcements} />
      <HeaderClient user={user} />
      <MobileMenu user={user} />
      <SearchOverlay />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
