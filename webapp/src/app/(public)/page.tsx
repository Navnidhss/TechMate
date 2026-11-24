import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/CtaBand";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HowItWorks } from "@/components/HowItWorks";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard } from "@/components/ServiceCard";
import { getActiveServices, getFaqs } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { absolute: "TechMate | Friendly IT help that comes to you — Perth" },
  description:
    "Computer repairs, IT support, virus removal and data recovery across the Perth metro — at your home, remotely, or at our workshop. Fixed quotes, no jargon.",
};

const QUICK_HELP = [
  { label: "My computer is slow or won't start", href: "/services/computer-repair", icon: "laptop" },
  { label: "I think I've got a virus", href: "/services/virus-removal", icon: "shield" },
  { label: "I've lost important files", href: "/data-recovery", icon: "drive" },
  { label: "My Wi-Fi keeps dropping out", href: "/services/networking", icon: "wifi" },
];

const TRUST_POINTS = [
  {
    icon: "check-circle",
    title: "Fixed quotes before work begins",
    text: "You'll know the price before we touch anything — no surprises on the invoice.",
  },
  {
    icon: "heart",
    title: "No fix, no fee",
    text: "If we can't solve it, you don't pay for the fix. Honest advice comes first.",
  },
  {
    icon: "bolt",
    title: "Same-day remote help",
    text: "Often within hours for remote support — no waiting around for a call-back.",
  },
] as const;

export default async function HomePage() {
  const [services, faqs, settings] = await Promise.all([getActiveServices(), getFaqs(), getSettings()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.businessName,
    description: settings.tagline,
    email: settings.contactEmail,
    telephone: settings.contactPhone,
    areaServed: "Perth Metropolitan Area, WA, Australia",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Perth",
      addressRegion: "WA",
      addressCountry: "AU",
    },
    openingHours: settings.tradingHours,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data for local search — content comes from editable settings.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden border-b border-line bg-surface">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Perth metro · Onsite, remote &amp; workshop
            </p>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Friendly IT help
              <br />
              that <span className="text-primary">comes to you.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-body sm:text-lg">
              Computer repairs, IT support and more — at your home, remotely, or at our workshop.
              Everywhere in Perth, explained in plain English.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn-accent">
                Book a visit
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/services" className="btn-outline">
                See what we fix
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={16} className="text-success" />
                No call-out fee
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={16} className="text-success" />
                Fixed quotes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={16} className="text-success" />
                No jargon
              </span>
            </div>
          </div>

          {/* "What's going wrong?" helper card — the friendly front door */}
          <div className="card relative p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">What&apos;s going wrong?</h2>
                <p className="mt-1 text-sm">Pick the closest match — we&apos;ll take it from there.</p>
              </div>
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:inline-flex">
                <Icon name="headset" size={22} />
              </span>
            </div>

            <ul className="mt-5 space-y-2">
              {QUICK_HELP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <Icon name={item.icon} size={18} className="shrink-0 text-primary" />
                    <span className="flex-1">{item.label}</span>
                    <Icon name="arrow-right" size={15} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm">
              <p>
                Something else?{" "}
                <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
                  Just ask us
                </Link>{" "}
                — no question is too small.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line bg-card">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                <Icon name={point.icon} size={20} />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-ink">{point.title}</h2>
                <p className="mt-0.5 text-sm leading-relaxed">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="What we help with"
              title="Practical fixes for everyday tech troubles"
              intro="From a laptop that won't start to Wi-Fi that disappears in the back room — if it's tech and it's misbehaving, it's our kind of job."
            />
            <Link href="/services" className="btn-outline shrink-0">
              All services
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-card py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Simple from start to finish"
            title="How it works"
            intro="Three steps, no confusing forms, and a real person at the other end."
            align="center"
          />
          <HowItWorks />
        </div>
      </section>

      {/* Data recovery highlight */}
      <section className="section">
        <div className="container-page">
          <div className="grid gap-8 rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-10 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
              <Icon name="drive" size={30} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Lost files?</p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-ink">
                Don&apos;t give up on your photos and documents yet
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
                Free assessment, honest advice, and no recovery fee if we can&apos;t get your data back.
                Stop using the device and let us take a careful look.
              </p>
            </div>
            <Link href="/data-recovery" className="btn-primary shrink-0">
              Data recovery help
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="border-t border-line bg-card py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Good to know"
              title="Questions people ask us"
              intro="Straight answers, no sales pitch. If yours isn't here, just ask."
            />
            <Link href="/faq" className="btn-outline mt-6">
              Read all FAQs
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
          <FaqAccordion faqs={faqs.slice(0, 4)} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
