import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PROVINCES } from "@/lib/constants";
import { addAddress, deleteAddress, setDefaultAddress } from "../actions";
import { ActionForm } from "@/components/account/ActionForm";
import { Field } from "@/components/forms/Field";

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }] });

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-3xl">Saved addresses</h2>
        {addresses.length === 0 ? (
          <p className="mt-4 text-ink-soft">No saved addresses yet. Add one below for one-tap checkout.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="card p-5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{a.fullName}</p>
                  {a.isDefault && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase">Default</span>}
                </div>
                <p className="mt-1 text-ink-soft">{a.line1}</p>
                {a.line2 && <p className="text-ink-soft">{a.line2}</p>}
                <p className="text-ink-soft">
                  {a.city}, {a.province} {a.postalCode}
                </p>
                <p className="text-ink-soft">{a.phone}</p>
                <div className="mt-4 flex gap-4 text-xs font-semibold">
                  {!a.isDefault && (
                    <form action={setDefaultAddress.bind(null, a.id)}>
                      <button className="underline underline-offset-4">Make default</button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, a.id)}>
                    <button className="text-sale underline underline-offset-4">Remove</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6 md:p-8">
        <h3 className="font-display text-2xl">Add a new address</h3>
        <ActionForm action={addAddress} submitLabel="Save address" resetOnSuccess className="mt-6" fieldsClassName="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="a-name">
            <input id="a-name" name="fullName" className="input" required defaultValue={user.name} />
          </Field>
          <Field label="Phone" htmlFor="a-phone">
            <input id="a-phone" name="phone" className="input" required defaultValue={user.phone ?? ""} />
          </Field>
          <Field label="Street address" htmlFor="a-line1" className="sm:col-span-2">
            <input id="a-line1" name="line1" className="input" required />
          </Field>
          <Field label="Apartment / landmark (optional)" htmlFor="a-line2" className="sm:col-span-2">
            <input id="a-line2" name="line2" className="input" />
          </Field>
          <Field label="City" htmlFor="a-city">
            <input id="a-city" name="city" className="input" required />
          </Field>
          <Field label="Province" htmlFor="a-province">
            <select id="a-province" name="province" className="input" required defaultValue="">
              <option value="" disabled>
                Select province
              </option>
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Postal code (optional)" htmlFor="a-postal">
            <input id="a-postal" name="postalCode" className="input" inputMode="numeric" />
          </Field>
        </ActionForm>
      </section>
    </div>
  );
}
