"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { whatsappHref } from "@/lib/contact";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";
import { useAdminForm } from "./useAdminForm";

export type SettingsValues = {
  announcements: string[];
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  pointsPer100: number;
  maxPointsRedeemPercent: number;
  bankDetails: string;
  walletDetails: string;
  storeAddress: string;
  storeHours: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  settings: SettingsValues;
};

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <p className="mt-0.5 text-xs text-muted">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  hint,
  prefix,
  suffix,
  max,
}: {
  name: string;
  label: string;
  defaultValue: number;
  hint?: string;
  prefix?: string;
  suffix?: string;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={`s-${name}`} className="label">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">{prefix}</span>}
        <input
          id={`s-${name}`}
          name={name}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={1}
          defaultValue={defaultValue}
          required
          className={`input h-11 tabular-nums ${prefix ? "pl-12" : ""} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  hint,
  type = "text",
  placeholder,
  maxLength,
  onChange,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: React.ReactNode;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={`s-${name}`} className="label">
        {label}
      </label>
      <input
        id={`s-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={onChange && ((e) => onChange(e.target.value))}
        className="input h-11"
      />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SettingsForm({ action, settings }: Props) {
  const { state, pending, onSubmit } = useAdminForm(action);
  const [announcements, setAnnouncements] = useState(settings.announcements.join("\n"));
  const [whatsapp, setWhatsapp] = useState(settings.whatsappNumber);
  const [whatsappMessage, setWhatsappMessage] = useState(settings.whatsappMessage);
  const whatsappLink = whatsappHref(whatsapp, whatsappMessage);
  const lines = announcements
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card title="Announcement bar" description="Messages that rotate in the strip above the store header. One per line.">
        <div>
          <label htmlFor="s-announcements" className="label">
            Messages
          </label>
          <textarea
            id="s-announcements"
            name="announcements"
            value={announcements}
            onChange={(e) => setAnnouncements(e.target.value)}
            className="input min-h-32 leading-relaxed"
            placeholder="Free nationwide delivery on orders over Rs. 3,000"
          />
          <p className="mt-1.5 text-xs text-muted">
            {lines.length} {lines.length === 1 ? "message" : "messages"} · leave empty to hide the bar
          </p>
        </div>
        {lines.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-ink px-4 py-2.5 text-center text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-paper">
            <span className="block truncate">{lines[0]}</span>
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Shipping" description="Fees charged at checkout, in rupees.">
          <NumberField
            name="freeShippingThreshold"
            label="Free standard shipping from"
            prefix="Rs."
            defaultValue={settings.freeShippingThreshold}
            hint="Orders at or above this subtotal ship free. Use 0 to always charge shipping."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField name="standardShippingFee" label="Standard fee" prefix="Rs." defaultValue={settings.standardShippingFee} />
            <NumberField
              name="expressShippingFee"
              label="Express fee"
              prefix="Rs."
              defaultValue={settings.expressShippingFee}
              hint="Express is never free."
            />
          </div>
        </Card>

        <Card title="Balincia Points" description="Loyalty points are earned on delivered orders; 1 point = Rs. 1 at checkout.">
          <NumberField
            name="pointsPer100"
            label="Points earned per Rs. 100"
            defaultValue={settings.pointsPer100}
            max={100}
            hint={`e.g. a ${formatPrice(5000)} order earns ${50 * settings.pointsPer100} points at the current rate.`}
          />
          <NumberField
            name="maxPointsRedeemPercent"
            label="Max order share payable with points"
            suffix="%"
            max={100}
            defaultValue={settings.maxPointsRedeemPercent}
            hint="Caps how much of the subtotal (after discounts) points can cover."
          />
        </Card>
      </div>

      <Card
        title="Contact & social"
        description="Shown in the footer, on the contact page, in policies and on invoices. Leave a field empty to hide it."
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <TextField name="storeAddress" label="Store address" defaultValue={settings.storeAddress} maxLength={200} placeholder="Flagship Atelier, Dolmen Mall Clifton, Karachi" />
          <TextField name="storeHours" label="Opening hours" defaultValue={settings.storeHours} maxLength={100} placeholder="Mon – Sun, 11am – 10pm" />
          <TextField name="contactPhone" label="Phone" type="tel" defaultValue={settings.contactPhone} maxLength={30} placeholder="+92 21 1234567" />
          <TextField name="contactEmail" label="Email" type="email" defaultValue={settings.contactEmail} maxLength={120} placeholder="care@yourstore.pk" />
          <TextField
            name="whatsappNumber"
            label="WhatsApp number"
            type="tel"
            defaultValue={settings.whatsappNumber}
            maxLength={30}
            placeholder="0300-1234567"
            onChange={setWhatsapp}
            hint={
              whatsapp.trim() === "" ? (
                "Empty — the WhatsApp chat button is hidden."
              ) : whatsappLink ? (
                <>
                  Chat button opens{" "}
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-2">
                    {whatsappLink.split("?")[0].replace("https://", "")}
                  </a>
                </>
              ) : (
                <span className="text-sale">Not a valid number yet — use 0300-1234567 or +92 300 1234567.</span>
              )
            }
          />
          <TextField
            name="whatsappMessage"
            label="WhatsApp greeting"
            defaultValue={settings.whatsappMessage}
            maxLength={300}
            onChange={setWhatsappMessage}
            hint="Pre-filled in the customer's chat when they tap the WhatsApp button."
          />
        </div>
        <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <TextField name="instagramUrl" label="Instagram" type="url" defaultValue={settings.instagramUrl} maxLength={300} placeholder="https://instagram.com/…" />
          <TextField name="facebookUrl" label="Facebook" type="url" defaultValue={settings.facebookUrl} maxLength={300} placeholder="https://facebook.com/…" />
          <TextField name="tiktokUrl" label="TikTok" type="url" defaultValue={settings.tiktokUrl} maxLength={300} placeholder="https://tiktok.com/@…" />
          <TextField name="youtubeUrl" label="YouTube" type="url" defaultValue={settings.youtubeUrl} maxLength={300} placeholder="https://youtube.com/@…" />
        </div>
      </Card>

      <Card title="Payment instructions" description="Shown to customers who choose bank transfer or a mobile wallet.">
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <label htmlFor="s-bank" className="label">
              Bank transfer details
            </label>
            <textarea
              id="s-bank"
              name="bankDetails"
              defaultValue={settings.bankDetails}
              className="input min-h-28 font-mono text-sm leading-relaxed"
              maxLength={1000}
            />
          </div>
          <div>
            <label htmlFor="s-wallet" className="label">
              JazzCash / Easypaisa details
            </label>
            <textarea
              id="s-wallet"
              name="walletDetails"
              defaultValue={settings.walletDetails}
              className="input min-h-28 font-mono text-sm leading-relaxed"
              maxLength={1000}
            />
          </div>
        </div>
      </Card>

      <div className="card sticky bottom-4 z-10 flex flex-col gap-3 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {state ? <FormMessage state={state} /> : <p className="text-sm text-muted">Changes apply to the store as soon as you save.</p>}
        </div>
        <SubmitButton pending={pending} pendingLabel="Saving…">
          Save settings
        </SubmitButton>
      </div>
    </form>
  );
}
