"use client";

import { ApiForm } from "./ApiForm";
import { Field } from "./Field";

const REASONS = ["Changed my mind", "Didn't suit my skin", "Received the wrong item", "Item arrived damaged / leaking", "Scent different from expected", "Other"];

export function ReturnForm({ defaultOrder }: { defaultOrder?: string }) {
  return (
    <ApiForm
      endpoint="/api/returns"
      submitLabel="Submit request"
      success={{ title: "Request received", body: "We'll WhatsApp or email you within 24 hours to arrange pickup. Keep the item sealed in its original packaging." }}
    >
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order number" htmlFor="r-order" error={errors.orderNumber}>
              <input id="r-order" name="orderNumber" className="input uppercase" defaultValue={defaultOrder} placeholder="BLC-XXXXXX" required aria-invalid={!!errors.orderNumber} />
            </Field>
            <Field label="Email used at checkout" htmlFor="r-email" error={errors.email}>
              <input id="r-email" name="email" type="email" className="input" required aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone (optional)" htmlFor="r-phone">
              <input id="r-phone" name="phone" type="tel" className="input" />
            </Field>
            <Field label="Reason" htmlFor="r-reason" error={errors.reason}>
              <select id="r-reason" name="reason" className="input" required defaultValue="">
                <option value="" disabled>
                  Choose a reason
                </option>
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>
          <fieldset>
            <legend className="label">I&apos;d like</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["EXCHANGE", "An exchange"],
                ["REFUND", "A refund"],
                ["STORE_CREDIT", "Store credit"],
              ].map(([value, label], i) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white/70 px-4 py-3 text-sm has-[:checked]:border-ink">
                  <input type="radio" name="resolution" value={value} defaultChecked={i === 0} className="accent-[#16120f]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Details (optional)" htmlFor="r-details">
            <textarea id="r-details" name="details" className="input" placeholder="Which item(s), and anything else we should know" />
          </Field>
        </>
      )}
    </ApiForm>
  );
}
