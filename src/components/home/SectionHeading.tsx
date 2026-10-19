import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("mb-10", align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-[1.08] text-balance md:text-[2.75rem]">{title}</h2>
      {description && <p className="mt-3 text-ink-soft">{description}</p>}
    </div>
  );
}
