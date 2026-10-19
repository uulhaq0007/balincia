import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader eyebrow="Store" title="Settings" description="Announcements, shipping, loyalty, contact details and payment instructions." />
      <SettingsForm action={saveSettings} settings={settings} />
    </div>
  );
}
