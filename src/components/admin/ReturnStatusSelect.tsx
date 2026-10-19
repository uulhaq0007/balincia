"use client";

import { useOptimistic, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { RETURN_STATUSES, type ActionState } from "@/lib/admin";
import { titleCase } from "@/lib/utils";

type Props = {
  action: (status: string) => Promise<ActionState>;
  status: string;
  label: string;
};

export function ReturnStatusSelect({ action, status, label }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  return (
    <span className="relative inline-flex items-center">
      <select
        value={optimistic}
        aria-label={label}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            setOptimistic(next);
            await action(next);
          });
        }}
        className="input h-9 w-36 rounded-full pl-3.5 text-xs font-semibold"
      >
        {RETURN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {titleCase(s)}
          </option>
        ))}
      </select>
      {pending && <LoaderCircle size={13} className="absolute -right-5 animate-spin text-muted" />}
    </span>
  );
}
