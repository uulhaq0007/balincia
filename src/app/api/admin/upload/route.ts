import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { MEDIA_PREFIX, UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });

  const ext = EXTENSIONS[file.type];
  if (!ext) return NextResponse.json({ error: "Only PNG, JPG, WebP, AVIF or GIF images are allowed." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 413 });

  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
  const filename = `${Date.now()}-${base}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `${MEDIA_PREFIX}${filename}` }, { status: 201 });
}
