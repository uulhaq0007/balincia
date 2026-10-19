"use client";

import { useRef, useState, useTransition } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import type { ActionState } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Props = {
  action: () => Promise<ActionState | void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  className?: string;
  children: React.ReactNode;
  /** Disables the trigger; the reason is shown as its tooltip. */
  disabledReason?: string;
  "aria-label"?: string;
};

/** A trigger button that opens a modal confirmation before running a server action. */
export function ConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Delete",
  className,
  children,
  disabledReason,
  ...rest
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState>(null);

  function open() {
    setResult(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function confirm() {
    startTransition(async () => {
      const res = await action();
      if (res && (res.error || res.message)) setResult(res);
      else close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(className, "disabled:cursor-not-allowed disabled:opacity-30")}
        aria-label={rest["aria-label"]}
        disabled={Boolean(disabledReason)}
        title={disabledReason}
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-[#fffdf9] p-0 text-ink shadow-2xl backdrop:bg-ink/40"
        onClick={(e) => {
          if (e.target === dialogRef.current && !pending) close();
        }}
      >
        {result ? (
          <div className="p-6">
            <div className="flex items-start gap-3">
              {result.error ? (
                <CircleAlert size={20} className="mt-0.5 shrink-0 text-sale" />
              ) : (
                <CircleCheck size={20} className="mt-0.5 shrink-0 text-sage" />
              )}
              <p className="text-sm leading-relaxed text-ink-soft">{result.error ?? result.message}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn btn-primary btn-sm" onClick={close}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="font-display text-xl">{title}</h2>
            {description && <div className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={close} disabled={pending}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm bg-sale text-white hover:bg-[#82302c]"
                onClick={confirm}
                disabled={pending}
                autoFocus
              >
                {pending && <LoaderCircle size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
