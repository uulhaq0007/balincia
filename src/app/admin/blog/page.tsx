import Link from "next/link";
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/admin/EmptyState";
import { FlagToggle } from "@/components/admin/FlagToggle";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostCover } from "@/components/admin/PostCover";
import { readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { cn, parsePalette } from "@/lib/utils";
import { deletePost, setPostPublished } from "./actions";

export const metadata = { title: "Journal" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BlogAdminPage({ searchParams }: Props) {
  const deleted = readParam(await searchParams, "notice") === "deleted";
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, palette: true, author: true, published: true, createdAt: true, updatedAt: true },
  });
  const drafts = posts.filter((p) => !p.published).length;

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Journal"
        description={`${posts.length} ${posts.length === 1 ? "story" : "stories"}${drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}`}
      >
        <Link href="/admin/blog/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> New post
        </Link>
      </PageHeader>

      {deleted && <Notice>Post deleted.</Notice>}

      <div className="card overflow-hidden">
        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title="No posts yet">
            Write a guide or story for the Journal.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {posts.map((post) => (
              <li key={post.id} className={cn("flex items-center gap-4 px-5 py-4", !post.published && "bg-paper/60")}>
                <Link href={`/admin/blog/${post.id}`} className="hidden shrink-0 sm:block" tabIndex={-1} aria-hidden>
                  <PostCover palette={parsePalette(post.palette)} className="h-16 w-26" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/blog/${post.id}`} className="font-display text-lg leading-snug text-ink hover:text-gold">
                    {post.title}
                  </Link>
                  {post.excerpt && <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{post.excerpt}</p>}
                  <p className="mt-1 text-xs text-muted">
                    {post.author} · {formatDate(post.createdAt)}
                    {post.updatedAt.getTime() - post.createdAt.getTime() > 60_000 && <> · edited {formatDate(post.updatedAt)}</>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs font-medium text-muted md:inline">{post.published ? "Live" : "Draft"}</span>
                  <FlagToggle
                    action={setPostPublished.bind(null, post.id)}
                    checked={post.published}
                    label={`${post.title} published`}
                  />
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-paper-2 hover:text-ink"
                    aria-label={`Edit ${post.title}`}
                  >
                    <Pencil size={15} />
                  </Link>
                  <ConfirmButton
                    action={deletePost.bind(null, post.id)}
                    title="Delete this post?"
                    description={`“${post.title}” will be permanently removed from the Journal.`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-rose-50 hover:text-sale"
                    aria-label={`Delete ${post.title}`}
                  >
                    <Trash2 size={15} />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
