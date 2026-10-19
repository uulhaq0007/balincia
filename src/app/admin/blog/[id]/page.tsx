import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { Pill } from "@/components/admin/StatusPill";
import { readParam } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deletePost, savePost } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `Edit “${post.title}”` : "Post" };
}

export default async function EditPostPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/blog", label: "Journal" }}
        eyebrow="Content"
        title={post.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {post.published ? <Pill tone="emerald">Live</Pill> : <Pill tone="stone">Draft</Pill>}
            Created {formatDate(post.createdAt)} · last edited {formatDate(post.updatedAt)}
          </span>
        }
      />

      {readParam(sp, "notice") === "created" && <Notice>Post created.</Notice>}

      <PostForm
        action={savePost.bind(null, post.id)}
        storeHref={`/blog/${post.slug}`}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          palette: post.palette,
          author: post.author,
          published: post.published,
        }}
        footer={
          <ConfirmButton
            action={deletePost.bind(null, post.id)}
            title="Delete this post?"
            description={`“${post.title}” will be permanently removed from the Journal. This can't be undone.`}
            className="btn btn-ghost btn-sm w-full text-sale hover:bg-rose-50"
          >
            <Trash2 size={14} /> Delete post
          </ConfirmButton>
        }
      />
    </div>
  );
}
