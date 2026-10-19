"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  /** Override for forms submitted via useAdminForm (useFormStatus only tracks form actions). */
  pending?: boolean;
};

export function SubmitButton({ children, pendingLabel, pending, className, disabled, ...rest }: Props) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <button type="submit" disabled={busy || disabled} className={cn("btn btn-primary", className)} {...rest}>
      {busy && <LoaderCircle size={15} className="animate-spin" />}
      {busy && pendingLabel ? pendingLabel : children}
    </button>
  );
}
