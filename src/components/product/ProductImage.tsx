import { BottleArt } from "./BottleArt";
import { cn, parseImages, parsePalette } from "@/lib/utils";

type Props = {
  product: { name: string; images?: string; image?: string | null; palette: string; bottleShape: string };
  index?: number;
  className?: string;
  sizes?: string;
};

/** Shows the uploaded product photo if one exists, otherwise generative bottle art. */
export function ProductImage({ product, index = 0, className }: Props) {
  const images = product.image ? [product.image] : parseImages(product.images);
  const src = images[index] ?? images[0];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={product.name} className={cn("h-full w-full object-cover", className)} loading="lazy" />
    );
  }
  return (
    <BottleArt
      palette={parsePalette(product.palette)}
      shape={product.bottleShape}
      name={product.name}
      className={cn("h-full w-full", className)}
    />
  );
}
