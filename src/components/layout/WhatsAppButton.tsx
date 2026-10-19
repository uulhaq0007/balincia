import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";

export async function WhatsAppButton() {
  const settings = await getSettings();
  const href = whatsappHref(settings.whatsappNumber, settings.whatsappMessage);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid h-13 w-13 place-items-center rounded-full bg-[#1f9d55] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
