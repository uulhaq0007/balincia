"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COUPON_TYPES, type ActionState } from "@/lib/admin";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useAdminForm } from "./useAdminForm";

type Coupon = {
  code: string;
  description: string;
  type: string;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  /** YYYY-MM-DD or empty. */
  expiresAt: string;
  isActive: boolean;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  coupon?: Coupon;
};

export function CouponForm({ action, coupon }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState(coupon?.type ?? "PERCENT");

  // Clear the form after creating so another code can be added straight away.
  useEffect(() => {
    if (state?.ok && !coupon) {
      formRef.current?.reset();
      setType("PERCENT");
    }
  }, [state, coupon]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="cp-code" className="label">
          Code
        </label>
        <input
          id="cp-code"
          name="code"
          defaultValue={coupon?.code}
          className="input h-11 font-mono uppercase tracking-wider"
          placeholder="EID25"
          required
          maxLength={30}
          pattern="[A-Za-z0-9_\-]{3,30}"
          title="3–30 letters, numbers, dashes or underscores"
          autoCapitalize="characters"
        />
      </div>
      <div>
        <label htmlFor="cp-description" className="label">
          Description
        </label>
        <input
          id="cp-description"
          name="description"
          defaultValue={coupon?.description}
          className="input h-11"
          placeholder="Eid campaign — 25% off sitewide"
          maxLength={200}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cp-type" className="label">
            Type
          </label>
          <select id="cp-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="input h-11">
            {COUPON_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cp-value" className="label">
            {type === "PERCENT" ? "Percent" : type === "FIXED" ? "Amount (Rs.)" : "Value"}
          </label>
          <input
            id="cp-value"
            name="value"
            type="number"
            min={type === "PERCENT" ? 1 : 0}
            max={type === "PERCENT" ? 100 : undefined}
            step={1}
            defaultValue={coupon?.value ?? ""}
            className="input h-11"
            disabled={type === "FREESHIP"}
            placeholder={type === "FREESHIP" ? "—" : type === "PERCENT" ? "10" : "500"}
            required={type !== "FREESHIP"}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cp-min" className="label">
            Min. subtotal
          </label>
          <input
            id="cp-min"
            name="minSubtotal"
            type="number"
            min={0}
            step={1}
            defaultValue={coupon?.minSubtotal ?? 0}
            className="input h-11"
            required
          />
        </div>
        <div>
          <label htmlFor="cp-max" className="label">
            Max uses
          </label>
          <input
            id="cp-max"
            name="maxUses"
            type="number"
            min={1}
            step={1}
            defaultValue={coupon?.maxUses ?? ""}
            className="input h-11"
            placeholder="Unlimited"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 items-end gap-3">
        <div>
          <label htmlFor="cp-expires" className="label">
            Expires
          </label>
          <input id="cp-expires" name="expiresAt" type="date" defaultValue={coupon?.expiresAt} className="input h-11" />
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={coupon?.isActive ?? true}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Active
        </label>
      </div>
      <FormMessage state={state} />
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending} className="btn-sm flex-1">
          {coupon ? "Save coupon" : "Create coupon"}
        </SubmitButton>
        {coupon && (
          <Link href="/admin/coupons" className="btn btn-ghost btn-sm">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
