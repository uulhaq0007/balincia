import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | Balincia" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [pendingOrders, unreadMessages, openReturns] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.returnRequest.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <AdminSidebar adminName={admin.name} badges={{ orders: pendingOrders, inbox: unreadMessages + openReturns }} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
