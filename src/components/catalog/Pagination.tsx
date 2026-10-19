import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export function Pagination({ page, pages, basePath, searchParams }: Props) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v == null) continue;
      params.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  return (
    <nav className="mt-14 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <PageLink href={href(page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft size={16} />
      </PageLink>
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - numbers[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <PageLink href={href(n)} active={n === page} label={`Page ${n}`}>
            {n}
          </PageLink>
        </span>
      ))}
      <PageLink href={href(page + 1)} disabled={page >= pages} label="Next page">
        <ChevronRight size={16} />
      </PageLink>
    </nav>
  );
}

function PageLink({ href, children, active, disabled, label }: { href: string; children: React.ReactNode; active?: boolean; disabled?: boolean; label: string }) {
  const cls = cn(
    "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors",
    active ? "bg-ink text-paper" : "hover:bg-paper-2",
    disabled && "pointer-events-none opacity-30",
  );
  if (disabled) return <span className={cls} aria-hidden>{children}</span>;
  return (
    <Link href={href} className={cls} aria-label={label} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
