import { getSession } from "@/lib/auth";
import { csvCell } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 });

  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const lines = [
    ["email", "subscribed_at"].join(","),
    ...subscribers.map((s) => [csvCell(s.email), csvCell(s.createdAt)].join(",")),
  ];
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="balincia-subscribers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
