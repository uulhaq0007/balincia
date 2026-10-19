import { requireUser } from "@/lib/auth";
import { changePassword, updateProfile } from "../actions";
import { ActionForm } from "@/components/account/ActionForm";
import { Field } from "@/components/forms/Field";

export default async function AccountSettingsPage() {
  const user = await requireUser("/account/settings");
  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <section className="card p-6 md:p-8">
        <h2 className="font-display text-2xl">Profile</h2>
        <p className="mt-1 text-sm text-muted">Signed in as {user.email}</p>
        <ActionForm action={updateProfile} submitLabel="Save profile" className="mt-6">
          <Field label="Full name" htmlFor="s-name">
            <input id="s-name" name="name" className="input" defaultValue={user.name} required />
          </Field>
          <Field label="Phone" htmlFor="s-phone">
            <input id="s-phone" name="phone" type="tel" className="input" defaultValue={user.phone ?? ""} />
          </Field>
        </ActionForm>
      </section>
      <section className="card p-6 md:p-8">
        <h2 className="font-display text-2xl">Change password</h2>
        <ActionForm action={changePassword} submitLabel="Update password" resetOnSuccess className="mt-6">
          <Field label="Current password" htmlFor="p-current">
            <input id="p-current" name="current" type="password" className="input" autoComplete="current-password" required />
          </Field>
          <Field label="New password" htmlFor="p-next" hint="At least 8 characters">
            <input id="p-next" name="next" type="password" className="input" autoComplete="new-password" required minLength={8} />
          </Field>
          <Field label="Confirm new password" htmlFor="p-confirm">
            <input id="p-confirm" name="confirm" type="password" className="input" autoComplete="new-password" required />
          </Field>
        </ActionForm>
      </section>
    </div>
  );
}
