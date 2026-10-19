import { CircleAlert, CircleCheck } from "lucide-react";
import type { ActionState } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function FormMessage({ state, className }: { state: ActionState; className?: string }) {
  if (!state || (!state.error && !state.message)) return null;
  const isError = Boolean(state.error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm",
        isError ? "bg-rose-50 text-sale" : "bg-emerald-50 text-sage",
        className,
      )}
    >
      {isError ? <CircleAlert size={16} className="mt-0.5 shrink-0" /> : <CircleCheck size={16} className="mt-0.5 shrink-0" />}
      <span>{state.error ?? state.message}</span>
    </p>
  );
}
