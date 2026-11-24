import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { getActiveServices } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export async function SiteFooter() {
  const [settings, services] = await Promise.all([getSettings(), getActiveServices()]);
  const year = new Date().getFullYear();
  const telHref = `tel:${settings.contactPhone.replace(/[^0-9+]/g, "")}`;

  return (
    <footer className="mt-auto border-t border-line bg-card">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5" aria-label="TechMate home">
            <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-ink">Tech</span>
              <span className="text-primary">Mate</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{settings.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="pill">Onsite</span>
            <span className="pill">Remote</span>
            <span className="pill">Workshop</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 6).map((service) => (
              <li key={service.id}>
                <Link href={`/services/${service.slug}`} className="transition-colors hover:text-primary">
                  {service.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="font-semibold text-primary hover:text-primary-dark">
                See all services →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Quick links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/pricing", label: "Pricing" },
              { href: "/service-areas", label: "Service areas" },
              { href: "/data-recovery", label: "Data recovery" },
              { href: "/remote-support", label: "Remote support" },
              { href: "/quote", label: "Get a quote" },
              { href: "/track", label: "Track your repair" },
              { href: "/faq", label: "FAQs" },
              { href: "/privacy", label: "Privacy" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`mailto:${settings.contactEmail}`} className="flex items-start gap-2.5 hover:text-primary">
                <Icon name="mail" size={17} className="mt-0.5 shrink-0 text-primary" />
                <span className="break-all">{settings.contactEmail}</span>
              </a>
            </li>
            <li>
              <a href={telHref} className="flex items-start gap-2.5 hover:text-primary">
                <Icon name="phone" size={17} className="mt-0.5 shrink-0 text-primary" />
                {settings.contactPhone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="clock" size={17} className="mt-0.5 shrink-0 text-primary" />
              <span>{settings.tradingHours}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="pin" size={17} className="mt-0.5 shrink-0 text-primary" />
              <span>{settings.workshopAddress}</span>
            </li>
          </ul>
          <Link href="/book" className="btn-accent btn-small mt-5">
            Book a visit
          </Link>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.businessName}
            {settings.abn ? ` · ABN ${settings.abn}` : ""} · Proudly local to Perth, Western Australia
          </p>
          <p>All prices include GST. Fixed quotes before any work begins.</p>
        </div>
      </div>
    </footer>
  );
}
