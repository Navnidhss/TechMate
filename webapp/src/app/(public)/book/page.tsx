import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { BookingForm } from "@/components/forms/BookingForm";
import { getActiveServices, getServiceAreas } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Visit",
  description:
    "Request an onsite, remote or workshop appointment anywhere in the Perth metro. Tell us what's wrong and we'll confirm a time and fixed quote.",
};

interface BookPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
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
        eyebrow="Book a visit"
        title="Let's get it sorted"
        intro="Tell us what's going wrong and when suits you. We'll confirm by email or phone — usually the same day — and give you a fixed quote before any work begins."
      />

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
