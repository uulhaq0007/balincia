import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  price: number;
  compareAtPrice?: number | null;
  from?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Price({ price, compareAtPrice, from, className, size = "md" }: Props) {
  const onSale = !!compareAtPrice && compareAtPrice > price;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          onSale && "text-sale",
          size === "sm" && "text-sm",
          size === "md" && "text-[0.95rem]",
          size === "lg" && "text-2xl",
        )}
      >
        {from && <span className="mr-1 text-[0.7em] font-medium uppercase tracking-wider text-muted">from</span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <span className={cn("text-muted line-through tabular-nums", size === "lg" ? "text-base" : "text-xs")}>
          {formatPrice(compareAtPrice!)}
        </span>
      )}
    </span>
  );
}
