import path from "path";

// Uploaded images live outside public/ (which `next start` only serves as of build time)
// and are streamed by the /media/[file] route, so uploads work the same in dev and production.
export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const MEDIA_PREFIX = "/media/";

export const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};
