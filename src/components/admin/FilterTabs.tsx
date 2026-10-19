import Link from "next/link";

type Tab = { label: string; href: string; active: boolean; count?: number };

export function FilterTabs({ tabs, label = "Filter" }: { tabs: Tab[]; label?: string }) {
  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className="chip shrink-0" data-active={tab.active} aria-current={tab.active ? "page" : undefined}>
          {tab.label}
          {tab.count !== undefined && <span className="text-[0.7rem] tabular-nums opacity-60">{tab.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
