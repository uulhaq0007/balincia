"use client";

import { startTransition, useActionState } from "react";
import type { ActionState } from "@/lib/admin";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * useActionState wired through onSubmit instead of <form action>. React 19
 * resets forms after a form action, which snaps <select>s back to their
 * mount-time defaults; submitting manually keeps fields showing saved values.
 */
export function useAdminForm(action: Action) {
  const [state, dispatch, pending] = useActionState(action, null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit };
}
