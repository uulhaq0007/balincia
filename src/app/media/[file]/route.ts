import { readFile } from "fs/promises";
import path from "path";
import { IMAGE_TYPES, UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Upload names are generated server-side as "<timestamp>-<slug>.<ext>"; anything else is rejected,
  // which also rules out path traversal.
  const match = file.match(/^[a-z0-9-]+\.([a-z]+)$/);
  const type = match && IMAGE_TYPES[match[1]];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
