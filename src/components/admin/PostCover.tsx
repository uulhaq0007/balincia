import { BottleArt } from "@/components/product/BottleArt";
import { cn } from "@/lib/utils";

/** The journal card artwork, mirroring the storefront's PostCard cover. */
export function PostCover({ palette, className }: { palette: [string, string]; className?: string }) {
  const [dark, light] = palette;
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ background: `linear-gradient(140deg, ${light}88, ${dark})` }}
    >
      <div className="grain absolute inset-0" />
      <BottleArt palette={palette} shape="round" bare className="absolute -bottom-8 -right-6 h-[105%] w-[55%] opacity-80" />
    </div>
  );
}
