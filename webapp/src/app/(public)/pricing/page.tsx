import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { getActiveServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest pricing for computer repair, IT support and data recovery across Perth. Fixed quotes before any work begins, no call-out fees.",
};

const PROMISES = [
  {
    icon: "check-circle",
    title: "Fixed quotes",
    text: "You'll get a clear price before we start. If something unexpected comes up, we check with you before doing more.",
  },
  {
    icon: "heart",
    title: "No fix, no fee",
    text: "If we can't fix the problem, you don't pay for the fix. We'll also tell you honestly when a repair isn't worth it.",
  },
  {
    icon: "pin",
    title: "No call-out fee",
    text: "No charge just for turning up anywhere in the Perth metro. Quotes are free and there's no obligation.",
  },
  {
    icon: "shield",
    title: "GST included",
    text: "All prices shown include GST. The price we quote is the price you pay — no surprise add-ons.",
  },
] as const;

export default async function PricingPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Straight prices, agreed before we start"
        intro="No call-out fees, no hidden extras, and no pressure. Here's what our services typically start from — every job gets a fixed quote first, based on what's actually needed."
      />

      <section className="section">
        <div className="container-page">
          {/* Phones: stacked cards — a 640px-wide table expands the layout viewport on
              mobile browsers, which zooms the whole page out. Cards below sm instead. */}
          <ul className="space-y-4 sm:hidden">
            {services.map((service) => (
              <li key={service.id} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Link
                    href={`/services/${service.slug}`}
                    className="font-semibold text-ink transition-colors hover:text-primary"
                  >
                    {service.name}
                  </Link>
                  <span className="font-semibold text-primary">{service.priceFrom ?? "Quoted per job"}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  {service.priceNotes ?? "Fixed quote before any work begins."}
                </p>
                <Link
                  href={`/book?service=${service.slug}`}
                  className="mt-3 inline-flex items-center gap-1 py-1 font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  Book<span className="sr-only"> {service.name}</span>
                  <Icon name="arrow-right" size={14} />
                </Link>
              </li>
            ))}
          </ul>

          {/* sm and up: the full table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">TechMate service price guide</caption>
                <thead>
                  <tr className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="px-5 py-3.5 font-semibold">Service</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Price guide</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">What to know</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold"><span className="sr-only">Book</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {services.map((service) => (
                    <tr key={service.id} className="align-top">
                      <td className="px-5 py-4">
                        <Link href={`/services/${service.slug}`} className="font-semibold text-ink hover:text-primary">
                          {service.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-primary">
                        {service.priceFrom ?? "Quoted per job"}
                      </td>
                      <td className="px-5 py-4 text-body">
                        {service.priceNotes ?? "Fixed quote before any work begins."}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/book?service=${service.slug}`}
                          className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-primary hover:text-primary-dark"
                        >
                          Book<span className="sr-only"> {service.name}</span>
                          <Icon name="arrow-right" size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Prices are a guide only and include GST. Every job is quoted individually — you approve the price before any work starts.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-card py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we charge"
            title="Honest pricing, every time"
            intro="We'd rather explain the cost clearly than surprise you later. Here's what that means in practice."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise) => (
              <div key={promise.title} className="card p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Icon name={promise.icon} size={20} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{promise.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed">{promise.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Want an exact price for your job?"
        text="Describe what's going on and we'll give you a fixed quote — free, with no obligation. If it's a quick fix, we'll say so."
        buttonLabel="Get a free quote"
        href="/quote"
      />
    </>
  );
}
