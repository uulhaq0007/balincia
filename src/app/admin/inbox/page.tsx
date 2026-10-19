import Link from "next/link";
import { Download, Inbox, Mail, MailOpen, Newspaper, RotateCcw, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { ReturnStatusSelect } from "@/components/admin/ReturnStatusSelect";
import { Pill } from "@/components/admin/StatusPill";
import { ADMIN_PAGE_SIZE, MESSAGE_TYPE_TONE, RETURN_STATUS_TONE, pageCount, readPage, readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn, titleCase } from "@/lib/utils";
import { deleteMessage, deleteSubscriber, setMessageRead, setReturnStatus } from "./actions";

export const metadata = { title: "Inbox" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type Tab = "messages" | "returns" | "subscribers";

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink";

export default async function InboxPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tabParam = readParam(sp, "tab");
  const tab: Tab = tabParam === "returns" || tabParam === "subscribers" ? tabParam : "messages";
  const page = readPage(sp);

  const [messageCount, unread, returnCount, openReturns, subscriberCount] = await Promise.all([
    db.contactMessage.count(),
    db.contactMessage.count({ where: { isRead: false } }),
    db.returnRequest.count(),
    db.returnRequest.count({ where: { status: "OPEN" } }),
    db.newsletterSubscriber.count(),
  ]);

  const tabs = [
    { label: unread ? `Messages · ${unread} new` : "Messages", href: "/admin/inbox", active: tab === "messages", count: messageCount },
    {
      label: openReturns ? `Returns · ${openReturns} open` : "Returns",
      href: "/admin/inbox?tab=returns",
      active: tab === "returns",
      count: returnCount,
    },
    { label: "Subscribers", href: "/admin/inbox?tab=subscribers", active: tab === "subscribers", count: subscriberCount },
  ];
  const total = tab === "messages" ? messageCount : tab === "returns" ? returnCount : subscriberCount;

  return (
    <div>
      <PageHeader eyebrow="Customer care" title="Inbox" description="Contact messages, return requests and newsletter subscribers.">
        {tab === "subscribers" && subscriberCount > 0 && (
          <a href="/api/admin/subscribers" className="btn btn-outline btn-sm" download>
            <Download size={15} /> Export CSV
          </a>
        )}
      </PageHeader>

      <FilterTabs tabs={tabs} label="Inbox sections" />

      <div className="card overflow-hidden">
        {tab === "messages" && <Messages page={page} />}
        {tab === "returns" && <Returns page={page} />}
        {tab === "subscribers" && <Subscribers page={page} />}
      </div>

      <Pagination
        page={page}
        pages={pageCount(total)}
        total={total}
        basePath="/admin/inbox"
        params={{ tab: tab === "messages" ? undefined : tab }}
        noun={tab}
      />
    </div>
  );
}

async function Messages({ page }: { page: number }) {
  const messages = await db.contactMessage.findMany({
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });
  if (messages.length === 0) return <EmptyState icon={Inbox} title="No messages">Contact form submissions will land here.</EmptyState>;

  return (
    <ul className="divide-y divide-line">
      {messages.map((m) => {
        const subject = m.subject || `${titleCase(m.type)} enquiry`;
        const long = m.message.length > 320;
        return (
          <li key={m.id} className={cn("flex flex-col gap-3 px-5 py-5 md:flex-row", !m.isRead && "bg-gold-soft/20")}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!m.isRead && <span className="h-2 w-2 rounded-full bg-gold" aria-label="Unread" />}
                <Pill tone={MESSAGE_TYPE_TONE[m.type]}>{titleCase(m.type)}</Pill>
                <p className={cn("text-sm text-ink", !m.isRead && "font-semibold")}>{subject}</p>
              </div>
              <p className="mt-1 text-xs text-muted">
                <span className="font-semibold text-ink-soft">{m.name}</span> · {m.email}
                {m.phone && <> · {m.phone}</>} · {formatDateTime(m.createdAt)}
              </p>
              {long ? (
                <details className="group mt-2 text-sm text-ink-soft">
                  <summary className="cursor-pointer list-none">
                    <span className="line-clamp-3 whitespace-pre-line group-open:hidden">{m.message}</span>
                    <span className="mt-1 inline-block text-xs font-semibold text-gold group-open:hidden">Read more</span>
                  </summary>
                  <p className="whitespace-pre-line leading-relaxed">{m.message}</p>
                </details>
              ) : (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{m.message}</p>
              )}
            </div>
            <div className="flex shrink-0 items-start gap-1">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
                className="btn btn-outline btn-sm"
              >
                <Mail size={14} /> Reply
              </a>
              <ActionButton
                action={setMessageRead.bind(null, m.id, !m.isRead)}
                className={iconButton}
                aria-label={m.isRead ? "Mark as unread" : "Mark as read"}
                title={m.isRead ? "Mark as unread" : "Mark as read"}
              >
                {m.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
              </ActionButton>
              <ConfirmButton
                action={deleteMessage.bind(null, m.id)}
                title="Delete this message?"
                description={`The message from ${m.name} will be permanently removed.`}
                className={cn(iconButton, "hover:bg-rose-50 hover:text-sale")}
                aria-label="Delete message"
              >
                <Trash2 size={15} />
              </ConfirmButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function Returns({ page }: { page: number }) {
  const returns = await db.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });
  if (returns.length === 0)
    return <EmptyState icon={RotateCcw} title="No return requests">Requests from the returns form will appear here.</EmptyState>;

  const orders = await db.order.findMany({
    where: { number: { in: returns.map((r) => r.orderNumber) } },
    select: { id: true, number: true, email: true },
  });
  const orderByNumber = new Map(orders.map((o) => [o.number, o]));

  return (
    <ul className="divide-y divide-line">
      {returns.map((r) => {
        const order = orderByNumber.get(r.orderNumber);
        const emailMismatch = order && order.email.toLowerCase() !== r.email.toLowerCase();
        return (
          <li key={r.id} className="flex flex-col gap-3 px-5 py-5 md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {order ? (
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-ink hover:text-gold">
                    {r.orderNumber}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">
                    {r.orderNumber} <span className="text-xs font-normal text-sale">· no matching order</span>
                  </span>
                )}
                <Pill tone={RETURN_STATUS_TONE[r.status]}>{titleCase(r.status)}</Pill>
                <Pill tone="stone">{titleCase(r.resolution)}</Pill>
              </div>
              <p className="mt-1 text-sm text-ink">{r.reason}</p>
              {r.details && <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{r.details}</p>}
              <p className="mt-2 text-xs text-muted">
                <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your return for ${r.orderNumber}`)}`} className="hover:text-gold">
                  {r.email}
                </a>
                {r.phone && <> · {r.phone}</>} · {formatDateTime(r.createdAt)}
                {emailMismatch && <span className="ml-1 font-semibold text-amber-700">· email differs from the order</span>}
              </p>
            </div>
            <ReturnStatusSelect
              action={setReturnStatus.bind(null, r.id)}
              status={r.status}
              label={`Status for return on ${r.orderNumber}`}
            />
          </li>
        );
      })}
    </ul>
  );
}

async function Subscribers({ page }: { page: number }) {
  const subscribers = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });
  if (subscribers.length === 0)
    return <EmptyState icon={Newspaper} title="No subscribers yet">Newsletter sign-ups from the store footer appear here.</EmptyState>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
          <th className="px-5 py-3 font-semibold">Email</th>
          <th className="px-3 py-3 font-semibold">Subscribed</th>
          <th className="px-5 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-line border-t border-line">
        {subscribers.map((s) => (
          <tr key={s.id} className="transition hover:bg-paper/60">
            <td className="max-w-0 truncate px-5 py-3 text-ink">
              <a href={`mailto:${s.email}`} className="hover:text-gold">
                {s.email}
              </a>
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{formatDate(s.createdAt)}</td>
            <td className="w-12 px-5 py-3 text-right">
              <ConfirmButton
                action={deleteSubscriber.bind(null, s.id)}
                title="Remove this subscriber?"
                description={`${s.email} will no longer receive the newsletter.`}
                confirmLabel="Remove"
                className={cn(iconButton, "hover:bg-rose-50 hover:text-sale")}
                aria-label={`Remove ${s.email}`}
              >
                <Trash2 size={15} />
              </ConfirmButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
