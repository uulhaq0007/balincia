import Link from "next/link";
import { BottleArt } from "@/components/product/BottleArt";
import { formatDate } from "@/lib/format";
import { parsePalette } from "@/lib/utils";

type Post = { slug: string; title: string; excerpt: string; palette: string; createdAt: Date };

export function PostCard({ post }: { post: Post }) {
  const [dark, light] = parsePalette(post.palette);
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl" style={{ background: `linear-gradient(140deg, ${light}88, ${dark})` }}>
          <div className="grain absolute inset-0" />
          <BottleArt
            palette={[dark, light]}
            shape="round"
            bare
            className="absolute -right-6 -bottom-8 h-[105%] w-[55%] opacity-80 transition-transform duration-700 group-hover:-translate-y-2"
          />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-muted uppercase">{formatDate(post.createdAt)}</p>
        <h3 className="mt-1.5 font-display text-2xl leading-snug transition-colors group-hover:text-gold">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>
      </Link>
    </article>
  );
}
