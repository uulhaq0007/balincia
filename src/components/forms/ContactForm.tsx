"use client";

import { useState } from "react";
import { ApiForm } from "./ApiForm";
import { Field } from "./Field";

const TYPES = [
  { value: "CONTACT", label: "General enquiry", placeholder: "How can we help?" },
  { value: "CORPORATE", label: "Corporate & bulk orders", placeholder: "Tell us about quantities, customisation and your timeline." },
  { value: "REQUEST", label: "Request a perfume", placeholder: "Describe the scent you're looking for — notes, a memory, or a fragrance you loved." },
];

export function ContactForm({ defaultType = "CONTACT" }: { defaultType?: string }) {
  const [type, setType] = useState(TYPES.some((t) => t.value === defaultType) ? defaultType : "CONTACT");
  const current = TYPES.find((t) => t.value === type)!;

  return (
    <ApiForm
      endpoint="/api/contact"
      submitLabel="Send message"
      success={{ title: "Message received", body: "Thank you for reaching out. Our team typically replies within a few hours during business hours." }}
    >
      {(errors) => (
        <>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Enquiry type">
            {TYPES.map((t) => (
              <button key={t.value} type="button" className="chip" data-active={type === t.value} onClick={() => setType(t.value)} role="radio" aria-checked={type === t.value}>
                {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={type} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="c-name" error={errors.name}>
              <input id="c-name" name="name" className="input" required aria-invalid={!!errors.name} />
            </Field>
            <Field label="Email" htmlFor="c-email" error={errors.email}>
              <input id="c-email" name="email" type="email" className="input" required aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone (optional)" htmlFor="c-phone">
              <input id="c-phone" name="phone" type="tel" className="input" />
            </Field>
            <Field label="Subject (optional)" htmlFor="c-subject">
              <input id="c-subject" name="subject" className="input" />
            </Field>
          </div>
          <Field label="Message" htmlFor="c-message" error={errors.message}>
            <textarea id="c-message" name="message" className="input min-h-36" placeholder={current.placeholder} required aria-invalid={!!errors.message} />
          </Field>
        </>
      )}
    </ApiForm>
  );
}
