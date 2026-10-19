"use client";

import { ORDER_STATUSES, ORDER_STATUS_META, PAYMENT_STATUSES } from "@/lib/constants";
import { COURIERS, type ActionState } from "@/lib/admin";
import { titleCase } from "@/lib/utils";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useAdminForm } from "./useAdminForm";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  order: { status: string; paymentStatus: string; courier: string | null; trackingNumber: string | null };
  /** Changes whenever the order is saved, so fields remount with the server's values. */
  version: string;
};

export function OrderUpdateForm({ action, order, version }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const cancelled = order.status === "CANCELLED";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div key={version} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="label">
              Order status
            </label>
            <select id="status" name="status" defaultValue={order.status} className="input h-11" disabled={cancelled}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)} — {ORDER_STATUS_META[s]?.label}
                </option>
              ))}
            </select>
            {cancelled && <input type="hidden" name="status" value="CANCELLED" />}
          </div>
          <div>
            <label htmlFor="paymentStatus" className="label">
              Payment
            </label>
            <select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus} className="input h-11">
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="courier" className="label">
              Courier
            </label>
            <select id="courier" name="courier" defaultValue={order.courier ?? ""} className="input h-11">
              <option value="">Not assigned</option>
              {order.courier && !(COURIERS as readonly string[]).includes(order.courier) && (
                <option value={order.courier}>{order.courier}</option>
              )}
              {COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="trackingNumber" className="label">
              Tracking number
            </label>
            <input
              id="trackingNumber"
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              className="input h-11"
              placeholder="e.g. 7712 3456 89"
              maxLength={60}
            />
          </div>
        </div>
        <div>
          <label htmlFor="note" className="label">
            Timeline note <span className="font-normal normal-case tracking-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={2}
            className="input min-h-0"
            placeholder="e.g. Called customer to confirm address"
            maxLength={500}
          />
        </div>
      </div>
      {cancelled && (
        <p className="text-xs text-muted">This order is cancelled — stock and points were restored, so its status is locked.</p>
      )}
      <FormMessage state={state} />
      <div className="flex justify-end">
        <SubmitButton className="btn-sm" pending={pending} pendingLabel="Saving…">
          Update order
        </SubmitButton>
      </div>
    </form>
  );
}
