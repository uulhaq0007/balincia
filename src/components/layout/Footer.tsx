import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { telHref, whatsappHref } from "@/lib/contact";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "@/components/ui/SocialIcons";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All perfumes", href: "/shop" },
      { label: "For him", href: "/collections/men" },
      { label: "For her", href: "/collections/women" },
      { label: "Gift sets", href: "/collections/gift-sets" },
      { label: "Discovery sets", href: "/collections/discovery-sets" },
      { label: "Home fragrance", href: "/collections/home-fragrance" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "My account", href: "/account" },
      { label: "Track your order", href: "/track" },
      { label: "Returns & exchanges", href: "/returns" },
      { label: "Shipping policy", href: "/policies/shipping" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Store locator", href: "/stores" },
      { label: "Corporate & bulk orders", href: "/contact?type=CORPORATE" },
      { label: "Request a perfume", href: "/contact?type=REQUEST" },
      { label: "The Journal", href: "/blog" },
      { label: "Scent quiz", href: "/quiz" },
    ],
  },
];

export async function Footer() {
  const s = await getSettings();
  const whatsapp = whatsappHref(s.whatsappNumber, s.whatsappMessage);
  const phone = telHref(s.contactPhone);
  const socials = [
    { href: s.instagramUrl, Icon: InstagramIcon, label: "Instagram" },
    { href: s.facebookUrl, Icon: FacebookIcon, label: "Facebook" },
    { href: s.tiktokUrl, Icon: TikTokIcon, label: "TikTok" },
    { href: s.youtubeUrl, Icon: YouTubeIcon, label: "YouTube" },
    { href: whatsapp ?? "", Icon: WhatsAppIcon, label: "WhatsApp" },
  ].filter((link) => link.href);

  return (
    <footer className="relative mt-24 overflow-hidden bg-oud text-paper">
      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:gap-20">
        <div>
          <p className="font-display text-4xl leading-tight md:text-5xl">
            Join the <em className="text-gold-2">inner circle</em>
          </p>
          <p className="mt-3 max-w-md text-sm text-paper/70">
            Early access to launches, private sales and scent stories — plus 10% off your first order.
          </p>
          <div className="mt-6 max-w-md">
            <NewsletterForm dark />
          </div>
          <div className="mt-8 flex gap-2">
            {socials.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-paper/20 text-paper/80 transition-colors hover:border-gold-2 hover:text-gold-2"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-gold-2">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-underline text-sm text-paper/75 hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow text-gold-2">Visit & talk</p>
            <ul className="mt-4 space-y-3 text-sm text-paper/75">
              {s.storeAddress && (
                <li className="flex gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold-2" />
                  <Link href="/stores" className="hover:text-paper">
                    {s.storeAddress}
                  </Link>
                </li>
              )}
              {s.contactPhone && (
                <li className="flex gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0 text-gold-2" />
                  {phone ? <a href={phone} className="hover:text-paper">{s.contactPhone}</a> : s.contactPhone}
                </li>
              )}
              {whatsapp && (
                <li className="flex gap-2">
                  <WhatsAppIcon size={16} className="mt-0.5 shrink-0 text-gold-2" />
                  <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-paper">
                    Chat on WhatsApp
                  </a>
                </li>
              )}
              {s.contactEmail && (
                <li className="flex gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-gold-2" />
                  <a href={`mailto:${s.contactEmail}`} className="break-all hover:text-paper">
                    {s.contactEmail}
                  </a>
                </li>
              )}
              {s.storeHours && <li className="text-paper/50">{s.storeHours}</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="pointer-events-none select-none overflow-hidden border-t border-paper/10">
        <p className="container-x -mb-[0.18em] text-center font-display text-[19vw] leading-[0.9] tracking-[0.06em] text-paper/[0.06] lg:text-[16rem]">
          BALINCIA
        </p>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-paper/50 md:flex-row">
          <p>© {new Date().getFullYear()} Balincia (Pvt) Ltd. Crafted in Pakistan.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/policies/privacy" className="hover:text-paper">Privacy</Link>
            <Link href="/policies/terms" className="hover:text-paper">Terms</Link>
            <Link href="/policies/returns" className="hover:text-paper">Refund policy</Link>
            <Link href="/policies/shipping" className="hover:text-paper">Shipping</Link>
          </div>
          <p className="flex items-center gap-2">
            {["COD", "Visa", "Mastercard", "JazzCash", "Easypaisa"].map((m) => (
              <span key={m} className="rounded border border-paper/15 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wider">
                {m}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
