import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQuery } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pages: number;
  total: number;
  basePath: string;
  /** Current filters to preserve in page links. */
  params?: Record<string, string | undefined>;
  noun?: string;
};

export function Pagination({ page, pages, total, basePath, params = {}, noun = "results" }: Props) {
  const href = (p: number) => `${basePath}${buildQuery({ ...params, page: p > 1 ? p : undefined })}`;
  const linkClass = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line transition";

  return (
    <div className="flex items-center justify-between gap-4 px-1 pt-4 text-sm text-muted">
      <p>
        {total.toLocaleString()} {noun}
        {pages > 1 && (
          <>
            {" "}· page {page} of {pages}
          </>
        )}
      </p>
      {pages > 1 && (
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(linkClass, "text-ink hover:border-ink")} aria-label="Previous page">
              <ChevronLeft size={16} />
            </Link>
          ) : (
            <span className={cn(linkClass, "opacity-40")} aria-hidden>
              <ChevronLeft size={16} />
            </span>
          )}
          {page < pages ? (
            <Link href={href(page + 1)} className={cn(linkClass, "text-ink hover:border-ink")} aria-label="Next page">
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className={cn(linkClass, "opacity-40")} aria-hidden>
              <ChevronRight size={16} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
