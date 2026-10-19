"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, Search, X } from "lucide-react";
import { useScrollLock, useUI } from "@/store/ui";
import { ProductImage } from "@/components/product/ProductImage";
import { Price } from "@/components/ui/Price";

type Result = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  images: string;
  palette: string;
  bottleShape: string;
};

const POPULAR = ["Oud", "Rose", "Saffron", "Fresh", "Gift set", "Attar", "Vanilla", "Office"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  useScrollLock(searchOpen);

  useEffect(() => setSearchOpen(false), [pathname, setSearchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  if (!searchOpen) return null;

  const submit = (term: string) => {
    if (!term.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} />
      <div className="animate-fade-up relative max-h-[90vh] overflow-y-auto bg-paper shadow-2xl">
        <div className="container-x py-6 md:py-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="flex items-center gap-3 border-b-2 border-ink pb-3"
          >
            <Search size={24} strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, note or mood…"
              className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-muted md:text-4xl"
              aria-label="Search products"
            />
            {loading && <LoaderCircle size={20} className="animate-spin text-muted" />}
            <button type="button" onClick={() => setSearchOpen(false)} className="rounded-full p-2 hover:bg-paper-2" aria-label="Close search">
              <X size={22} />
            </button>
          </form>

          {q.trim().length < 2 ? (
            <div className="mt-6">
              <p className="eyebrow mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button key={term} className="chip" onClick={() => submit(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              {results.length === 0 && !loading ? (
                <p className="text-ink-soft">No scents match “{q}”. Try a note like “oud” or “jasmine”.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {results.map((p) => (
                      <Link key={p.id} href={`/products/${p.slug}`} className="group">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-paper-2">
                          <ProductImage product={p} className="transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <p className="mt-2 font-display text-lg leading-tight">{p.name}</p>
                        <p className="truncate text-xs text-muted">{p.tagline}</p>
                        <Price price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
                      </Link>
                    ))}
                  </div>
                  <button onClick={() => submit(q)} className="btn btn-outline btn-sm mt-6">
                    See all results <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
