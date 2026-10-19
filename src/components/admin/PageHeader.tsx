import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  eyebrow?: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
};

export function PageHeader({ title, eyebrow, description, back, children }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-ink print:hidden"
          >
            <ChevronLeft size={14} /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-tight text-ink md:text-[2.1rem]">{title}</h1>
        {description && <div className="mt-2 text-sm text-ink-soft">{description}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 print:hidden">{children}</div>}
    </div>
  );
}
