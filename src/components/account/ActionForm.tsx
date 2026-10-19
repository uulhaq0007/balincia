"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { FormAlert } from "@/components/forms/Field";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/app/(store)/account/actions";

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: React.ReactNode;
  resetOnSuccess?: boolean;
  className?: string;
  fieldsClassName?: string;
};

/** Small wrapper around useActionState that renders success/error feedback and a pending submit button. */
export function ActionForm({ action, submitLabel, children, resetOnSuccess, className, fieldsClassName = "space-y-4" }: Props) {
  const [state, formAction] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={cn("space-y-5", className)}>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      {state.ok && state.message && <FormAlert tone="success">{state.message}</FormAlert>}
      <div className={fieldsClassName}>{children}</div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending && <LoaderCircle size={16} className="animate-spin" />} {label}
    </button>
  );
}
