import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/CtaBand";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Icon } from "@/components/Icon";
import { getActiveServices, getFaqs, getServiceBySlug, parseCsv, toParagraphs } from "@/lib/content";
import { DELIVERY_LABELS, DELIVERY_SHORT_LABELS } from "@/lib/statuses";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

// Content is edited in the admin, so service pages must render fresh.
export const revalidate = 0;

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: `${service.name} in Perth`,
    description: service.shortDesc,
    openGraph: {
      title: `${service.name} in Perth — TechMate`,
      description: service.shortDesc,
    },
  };
}

const DELIVERY_STEPS: Record<string, { icon: string; title: string; text: string }[]> = {
  onsite: [
    {
      icon: "calendar",
      title: "Book a time that suits",
      text: "Choose a day and time window online, or give us a ring. We'll confirm by email or phone.",
    },
    {
      icon: "pin",
      title: "We come to you",
      text: "We arrive with the tools we need, diagnose the problem on the spot, and explain what we found.",
    },
    {
      icon: "check-circle",
      title: "Fixed quote, then the fix",
      text: "Nothing happens until you approve the price. Once it's fixed, we show you what changed.",
    },
  ],
  remote: [
    {
      icon: "laptop",
      title: "Get your 9-digit AnyDesk ID",
      text: "Download AnyDesk from the official site and read us the number on your screen.",
    },
    {
      icon: "lock",
      title: "You stay in control",
      text: "You approve the connection and can see everything we do. Disconnect at any time.",
    },
    {
      icon: "check-circle",
      title: "Fixed while you watch",
      text: "Most remote jobs are done within the same session — often the same day you contact us.",
    },
  ],
  workshop: [
    {
      icon: "drive",
      title: "Arrange a drop-off",
      text: "Book in first so we're expecting you, then drop your device off — or ask about metro pick-up.",
    },
    {
      icon: "clock",
      title: "We assess and quote",
      text: "We look at the device carefully and come back to you with a fixed price before going ahead.",
    },
    {
      icon: "check-circle",
      title: "Collect when it's ready",
      text: "We'll let you know as soon as it's done, explain what happened, and hand it back working.",
    },
  ],
};

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, faqs] = await Promise.all([getServiceBySlug(slug), getFaqs()]);

  if (!service || !service.active) notFound();

  const delivery = parseCsv(service.delivery);
  const paragraphs = toParagraphs(service.description);
  const steps = delivery.flatMap((option) => DELIVERY_STEPS[option] ?? []).slice(0, 3);

  return (
    <>
      <section className="hero-glow border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-primary">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/services" className="hover:text-primary">Services</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{service.name}</li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {delivery.map((option) => (
                  <span key={option} className="pill">
                    {DELIVERY_SHORT_LABELS[option] ?? option}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                {service.name}
              </h1>
              <div className="heading-bar" />
              <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">{service.shortDesc}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/book?service=${service.slug}`} className="btn-accent">
                  Book this service
                  <Icon name="arrow-right" size={18} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Ask a question
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Price guide</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                {service.priceFrom ?? "Quoted per job"}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {service.priceNotes ?? "We give you a fixed quote before any work begins — no surprises."}
              </p>
              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                {delivery.map((option) => (
                  <li key={option} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                    <span>{DELIVERY_LABELS[option] ?? option}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                  <span>No call-out fee anywhere in the Perth metro</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">What this covers</h2>
            <div className="heading-bar" />
            <div className="prose-plain mt-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">How it works for you</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="flex gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={step.icon} size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={`/book?service=${service.slug}`} className="btn-primary mt-6 w-full">
              Book this service
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Common questions</h2>
            <div className="heading-bar" />
            <p className="mt-4 text-sm leading-relaxed">
              Still wondering something?{" "}
              <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
                Send us a message
              </Link>{" "}
              — we answer every one personally.
            </p>
          </div>
          <FaqAccordion faqs={faqs.slice(0, 4)} />
        </div>
      </section>

      <CtaBand
        title={`Ready to sort out ${service.name.toLowerCase()}?`}
        text="Tell us a little about the problem and we'll come back with clear next steps — usually the same day."
        buttonLabel="Book this service"
        href={`/book?service=${service.slug}`}
      />
    </>
  );
}
