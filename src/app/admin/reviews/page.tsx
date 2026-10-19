import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ExternalLink, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { FilterTabs } from "@/components/admin/FilterTabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { Pill } from "@/components/admin/StatusPill";
import { Stars } from "@/components/ui/Stars";
import { ADMIN_PAGE_SIZE, pageCount, readPage, readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteReview, setReviewApproval } from "./actions";

export const metadata = { title: "Reviews" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FILTERS: Record<string, Prisma.ReviewWhereInput> = {
  all: {},
  approved: { isApproved: true },
  hidden: { isApproved: false },
};

export default async function ReviewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filterParam = readParam(sp, "filter");
  const filter = filterParam === "approved" || filterParam === "hidden" ? filterParam : "all";
  const page = readPage(sp);
  const where = FILTERS[filter];

  const [approvedCount, hiddenCount, total, reviews] = await Promise.all([
    db.review.count({ where: FILTERS.approved }),
    db.review.count({ where: FILTERS.hidden }),
    db.review.count({ where }),
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true } },
      },
    }),
  ]);

  const tabs = [
    { label: "All", href: "/admin/reviews", active: filter === "all", count: approvedCount + hiddenCount },
    { label: "Approved", href: "/admin/reviews?filter=approved", active: filter === "approved", count: approvedCount },
    { label: "Hidden", href: "/admin/reviews?filter=hidden", active: filter === "hidden", count: hiddenCount },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Reviews"
        description="Approve, hide or remove customer reviews. Product ratings update automatically."
      />

      <FilterTabs tabs={tabs} label="Review status" />

      <div className="card overflow-hidden">
        {reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews here" />
        ) : (
          <ul className="divide-y divide-line">
            {reviews.map((review) => (
              <li key={review.id} className={cn("flex flex-col gap-4 px-5 py-5 md:flex-row", !review.isApproved && "bg-paper/60")}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars rating={review.rating} />
                    <Link href={`/admin/products/${review.product.id}`} className="text-sm font-semibold text-ink hover:text-gold">
                      {review.product.name}
                    </Link>
                    <Link
                      href={`/products/${review.product.slug}`}
                      target="_blank"
                      className="text-muted hover:text-ink"
                      aria-label={`View ${review.product.name} in store`}
                    >
                      <ExternalLink size={13} />
                    </Link>
                    {!review.isApproved && <Pill tone="stone">Hidden</Pill>}
                  </div>
                  {review.title && <p className="mt-2 font-display text-base text-ink">{review.title}</p>}
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{review.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {review.user ? (
                      <Link href={`/admin/customers/${review.user.id}`} className="font-semibold text-ink-soft hover:text-gold">
                        {review.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink-soft">{review.name}</span>
                    )}{" "}
                    · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  {review.isApproved ? (
                    <ActionButton action={setReviewApproval.bind(null, review.id, false)} className="btn btn-outline btn-sm">
                      <EyeOff size={14} /> Hide
                    </ActionButton>
                  ) : (
                    <ActionButton action={setReviewApproval.bind(null, review.id, true)} className="btn btn-primary btn-sm">
                      <Eye size={14} /> Approve
                    </ActionButton>
                  )}
                  <ConfirmButton
                    action={deleteReview.bind(null, review.id)}
                    title="Delete this review?"
                    description={`${review.name}'s review of ${review.product.name} will be permanently removed.`}
                    className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-full text-ink-soft transition hover:bg-rose-50 hover:text-sale"
                    aria-label="Delete review"
                  >
                    <Trash2 size={15} />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        page={page}
        pages={pageCount(total)}
        total={total}
        basePath="/admin/reviews"
        params={{ filter: filter === "all" ? undefined : filter }}
        noun={total === 1 ? "review" : "reviews"}
      />
    </div>
  );
}
