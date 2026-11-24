import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { BookingForm } from "@/components/forms/BookingForm";
import { getActiveServices, getServiceAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Request a Visit",
  description:
    "Send a booking request for onsite, remote or workshop help anywhere in the Perth metro. We'll confirm a time and give you a fixed quote.",
};

interface BookRequestPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function BookRequestPage({ searchParams }: BookRequestPageProps) {
  const [{ service: requestedService }, services, areas] = await Promise.all([
    searchParams,
    getActiveServices(),
    getServiceAreas(),
  ]);
  const preselected = services.find((service) => service.slug === requestedService);
  const suburbs = Array.from(new Set(areas.map((area) => area.suburb))).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <PageHero
        eyebrow="Booking request"
        title="Tell us what's going wrong"
        intro="Not sure when you're free, or the job needs a proper look first? Send a request and we'll reply with next steps — usually the same day."
      >
        <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary-dark">
          Want to lock in a time straight away?{" "}
          <Link href="/book" className="font-semibold underline underline-offset-2">
            Pick a time slot →
          </Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Booking request</h2>
            <div className="heading-bar" />
            <div className="mt-6">
              <BookingForm
                services={services.map((service) => ({ slug: service.slug, name: service.name }))}
                suburbs={suburbs}
                initialService={preselected?.slug}
                preselectedServiceName={preselected?.name}
              />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink">What happens next</h2>
              <ol className="mt-4 space-y-3 text-sm">
                {[
                  "We read your request and check the details.",
                  "We contact you to confirm a time and answer questions.",
                  "You get a fixed quote before any work begins.",
                  "We fix it onsite, remotely, or at the workshop.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-primary/5 p-6 text-sm">
              <p className="font-semibold text-ink">No call-out fee</p>
              <p className="mt-1 leading-relaxed">
                Anywhere in the Perth metro. If we can&apos;t fix it, you don&apos;t pay for the fix.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
