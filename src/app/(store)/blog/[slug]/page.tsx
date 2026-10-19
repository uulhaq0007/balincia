import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/lib/markdown";
import { parsePalette } from "@/lib/utils";
import { BottleArt } from "@/components/product/BottleArt";
import { PostCard } from "@/components/blog/PostCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await db.post.findFirst({ where: { slug: (await params).slug, published: true } });
  return post ? { title: post.title, description: post.excerpt } : { title: "Story not found" };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findFirst({ where: { slug, published: true } });
  if (!post) notFound();
  const more = await db.post.findMany({ where: { published: true, id: { not: post.id } }, orderBy: { createdAt: "desc" }, take: 3 });
  const [dark, light] = parsePalette(post.palette);

  return (
    <article>
      <header className="container-x pt-4">
        <div className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-paper md:px-16 md:py-24" style={{ background: `linear-gradient(140deg, ${dark}, ${dark}ee 50%, ${light}aa)` }}>
          <div className="grain absolute inset-0" />
          <BottleArt palette={[dark, light]} shape="round" bare className="absolute -right-10 -bottom-16 hidden h-96 w-80 opacity-80 md:block" />
          <div className="relative max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-bold tracking-[0.16em] uppercase opacity-80 hover:opacity-100">
              <ChevronLeft size={14} /> The Journal
            </Link>
            <h1 className="mt-6 font-display text-4xl leading-[1.08] text-balance md:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-xl text-paper/75">{post.excerpt}</p>
            <p className="mt-6 text-xs font-semibold tracking-[0.16em] uppercase opacity-70">
              {post.author} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
      </header>
      <div className="container-x">
        <div className="prose-balincia mx-auto max-w-2xl py-14 text-[1.075rem]">
          <Markdown source={post.content} />
        </div>
      </div>
      {more.length > 0 && (
        <section className="container-x border-t border-line pt-14">
          <h2 className="mb-8 font-display text-3xl">Keep reading</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
