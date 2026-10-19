"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import { isImageUrl } from "@/lib/admin";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
};

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif";

export function ImageListField({ images, onChange, max = 12 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const full = images.length >= max;

  function addUrl() {
    const value = url.trim();
    if (!value) return;
    if (!isImageUrl(value)) return setError("Enter a full https:// URL or a site path like /media/photo.jpg.");
    if (images.includes(value)) return setError("That image is already in the list.");
    onChange([...images, value]);
    setUrl("");
    setError(null);
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, max - images.length)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? `Upload failed (${res.status})`);
        added.push(json.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (added.length) onChange([...images, ...added]);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(index: number, delta: number) {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={src} className="group relative overflow-hidden rounded-xl border border-line bg-paper-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Product image ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-paper">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent p-1.5">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-full p-1.5 text-paper hover:bg-white/15 disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded-full p-1.5 text-paper hover:bg-white/15 disabled:opacity-30"
                    aria-label="Move later"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  className="rounded-full p-1.5 text-paper hover:bg-white/15"
                  aria-label="Remove image"
                >
                  <X size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-5 text-sm text-muted">
          <ImagePlus size={18} className="shrink-0 text-gold" />
          No photos yet — the store will show the generative bottle art below until you add some.
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="https://… or /media/…"
          className="input h-11 flex-1"
          disabled={full}
          aria-label="Image URL"
        />
        <button type="button" onClick={addUrl} className="btn btn-outline btn-sm h-11" disabled={full || !url.trim()}>
          Add URL
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn btn-primary btn-sm h-11"
          disabled={full || uploading}
        >
          {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
          Upload
        </button>
        <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      <p className="text-xs text-muted">PNG, JPG, WebP, AVIF or GIF up to 4 MB. The first image is the cover.</p>
      {error && (
        <p role="alert" className="text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
