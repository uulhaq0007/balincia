import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageHero } from "@/components/layout/PageHero";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = { title: "The Journal", description: "Stories, guides and notes on the art of fragrance." };

export default async function BlogPage() {
  const posts = await db.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHero eyebrow="The Journal" title={<>Notes on <em className="text-gold">scent</em></>} description="Guides, rituals and stories from the Balincia atelier." />
      <div className="container-x">
        {posts.length === 0 ? (
          <p className="text-center text-ink-soft">New stories are on their way.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
