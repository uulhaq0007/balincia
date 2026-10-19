"use client";

import type { ActionState } from "@/lib/admin";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useAdminForm } from "./useAdminForm";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  points: number;
};

export function LoyaltyPointsForm({ action, points }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="delta" className="label">
            Adjust by
          </label>
          {/* Keyed by balance so the field clears once the adjustment lands. */}
          <input
            key={points}
            id="delta"
            name="delta"
            type="number"
            step={1}
            inputMode="numeric"
            className="input h-11"
            placeholder="e.g. 250 or -100"
            required
          />
        </div>
        <SubmitButton pending={pending} className="btn-sm h-11">
          Apply
        </SubmitButton>
      </div>
      <p className="text-xs text-muted">Positive numbers add points, negative numbers deduct. Balances never go below zero.</p>
      <FormMessage state={state} />
    </form>
  );
}
