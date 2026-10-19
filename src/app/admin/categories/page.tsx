import Link from "next/link";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pill } from "@/components/admin/StatusPill";
import { readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { cn, parsePalette } from "@/lib/utils";
import { deleteCategory, saveCategory } from "./actions";

export const metadata = { title: "Categories" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CategoriesPage({ searchParams }: Props) {
  const editId = readParam(await searchParams, "edit");
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const editing = editId ? categories.find((c) => c.id === editId) : undefined;
  const nextSortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1;

  return (
    <div>
      <PageHeader eyebrow="Catalogue" title="Categories" description="Collections that group products in the store and navigation." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card overflow-hidden lg:self-start">
          {categories.length === 0 ? (
            <EmptyState icon={FolderTree} title="No categories yet">
              Create your first collection using the form.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="text-left text-[0.7rem] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 text-right font-semibold">Products</th>
                    <th className="px-3 py-3 text-right font-semibold">Order</th>
                    <th className="px-3 py-3 font-semibold">Nav</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line border-t border-line">
                  {categories.map((category) => {
                    const [dark, light] = parsePalette(category.palette);
                    const count = category._count.products;
                    return (
                      <tr key={category.id} className={cn("transition hover:bg-paper/60", category.id === editId && "bg-gold-soft/30")}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-10 w-10 shrink-0 rounded-lg border border-line"
                              style={{ background: `linear-gradient(135deg, ${dark}, ${light})` }}
                              aria-hidden
                            />
                            <span className="min-w-0">
                              <span className="block font-semibold text-ink">{category.name}</span>
                              <span className="block truncate text-xs text-muted">/collections/{category.slug}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          <Link href={`/admin/products?category=${category.id}`} className="text-ink-soft hover:text-gold">
                            {count}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{category.sortOrder}</td>
                        <td className="px-3 py-3">
                          {category.showInNav ? <Pill tone="emerald">Shown</Pill> : <Pill tone="stone">Hidden</Pill>}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/categories?edit=${category.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Pencil size={15} />
                            </Link>
                            <ConfirmButton
                              action={deleteCategory.bind(null, category.id)}
                              title={`Delete ${category.name}?`}
                              description="Its collection page will stop working. This can't be undone."
                              disabledReason={count > 0 ? "Move or delete this category's products first" : undefined}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-rose-50 hover:text-sale"
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="card p-5 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-4 font-display text-lg text-ink">{editing ? `Edit ${editing.name}` : "New category"}</h2>
          <CategoryForm
            key={editing?.id ?? "new"}
            action={saveCategory.bind(null, editing?.id ?? null)}
            category={
              editing && {
                name: editing.name,
                slug: editing.slug,
                description: editing.description,
                palette: editing.palette,
                sortOrder: editing.sortOrder,
                showInNav: editing.showInNav,
              }
            }
            nextSortOrder={nextSortOrder}
          />
        </section>
      </div>
    </div>
  );
}
