"use client";

import { useOptimistic, useTransition } from "react";
import { cn } from "@/lib/utils";

type Props = {
  action: (value: boolean) => Promise<unknown>;
  checked: boolean;
  label: string;
  showLabel?: boolean;
};

/** A compact switch that flips a boolean through a server action, optimistically. */
export function FlagToggle({ action, checked, label, showLabel = false }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      await action(next);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={showLabel ? undefined : label}
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft disabled:cursor-wait"
      title={label}
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          optimistic ? "bg-sage" : "bg-paper-3",
        )}
      >
        <span
          className={cn(
            "absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            optimistic ? "translate-x-[1.125rem]" : "translate-x-0.5",
          )}
        />
      </span>
      {showLabel && label}
    </button>
  );
}
