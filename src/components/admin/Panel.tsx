import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  aside?: React.ReactNode;
  className?: string;
  /** Pad the body (default) or let tables run edge to edge. */
  flush?: boolean;
  children: React.ReactNode;
};

export function Panel({ title, description, action, aside, className, flush = false, children }: Props) {
  return (
    <section className={cn("card overflow-hidden", className)}>
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-lg leading-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {aside}
        {action && (
          <Link href={action.href} className="shrink-0 text-xs font-semibold text-gold hover:text-ink print:hidden">
            {action.label} →
          </Link>
        )}
      </header>
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}
