import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/contact";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, s] = await Promise.all([searchParams, getSettings()]);
  const channels = [
    { Icon: WhatsAppIcon, title: "WhatsApp", body: s.whatsappNumber, href: whatsappHref(s.whatsappNumber, s.whatsappMessage), external: true },
    { Icon: Phone, title: "Call us", body: s.contactPhone, href: telHref(s.contactPhone) },
    { Icon: Mail, title: "Email", body: s.contactEmail, href: s.contactEmail ? `mailto:${s.contactEmail}` : null },
    { Icon: MapPin, title: "Flagship atelier", body: s.storeAddress, href: "/stores" },
    { Icon: Clock, title: "Hours", body: s.storeHours, href: null },
  ].filter((c) => c.body && (c.title !== "WhatsApp" || c.href));

  return (
    <>
      <PageHero
        eyebrow="We're here to help"
        title={type === "CORPORATE" ? "Corporate & bulk orders" : type === "REQUEST" ? "Request a perfume" : "Get in touch"}
        description="Questions about a scent, an order or a custom gifting project? Our fragrance team would love to hear from you."
      />
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {channels.map(({ Icon, title, body, href, external }) => {
            const inner = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper-2 text-gold">
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block text-xs font-bold tracking-[0.14em] text-muted uppercase">{title}</span>
                  <span className="block font-semibold">{body}</span>
                </span>
              </>
            );
            return href ? (
              <a
                key={title}
                href={href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="card flex items-center gap-4 p-5 transition-colors hover:border-ink-soft"
              >
                {inner}
              </a>
            ) : (
              <div key={title} className="card flex items-center gap-4 p-5">
                {inner}
              </div>
            );
          })}
        </div>
        <ContactForm defaultType={type} />
      </div>
    </>
  );
}
