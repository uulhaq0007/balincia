"use client";

import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  title?: string;
};

/** Runs a bound server action on click, with a spinner while it's in flight. */
export function ActionButton({ action, children, className, title, ...rest }: Props) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(async () => void (await action()))}
      disabled={pending}
      className={cn("relative disabled:cursor-wait", className)}
      aria-label={rest["aria-label"]}
      aria-busy={pending}
      title={title}
    >
      <span className={cn("inline-flex items-center gap-1.5", pending && "invisible")}>{children}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle size={14} className="animate-spin" />
        </span>
      )}
    </button>
  );
}
