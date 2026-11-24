import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { BookingScheduler, type SchedulerDate } from "@/components/forms/BookingScheduler";
import { getActiveServices, getServiceAreas } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { addDays, perthDate, perthDateString } from "@/lib/time";

export const metadata: Metadata = {
  title: "Book a Time",
  description:
    "Pick a real appointment time for computer repair, IT support or data recovery anywhere in the Perth metro. Instant confirmation.",
};

interface BookPageProps {
  searchParams: Promise<{ service?: string }>;
}

function buildDates(horizonDays: number): SchedulerDate[] {
  const today = perthDateString(new Date());
  const weekdayFormatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Perth",
    weekday: "short",
  });
  const monthFormatter = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Perth", month: "short" });
  const dayFormatter = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Perth", day: "numeric" });

  return Array.from({ length: horizonDays }, (_, index) => {
    const date = addDays(today, index);
    const value = perthDate(date);
    return {
      date,
      weekday: weekdayFormatter.format(value),
      day: dayFormatter.format(value),
      month: monthFormatter.format(value),
    };
  });
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const [{ service: requestedService }, services, areas, settings] = await Promise.all([
    searchParams,
    getActiveServices(),
    getServiceAreas(),
    getSettings(),
  ]);

  const suburbs = Array.from(new Set(areas.map((area) => area.suburb))).sort((a, b) => a.localeCompare(b));
  const horizon = Math.min(Math.max(Number(settings.schedHorizonDays) || 30, 1), 365);
  const dates = buildDates(horizon);

  return (
    <>
      <PageHero
        eyebrow="Live booking"
        title="Pick a time that suits you"
        intro="Choose your service, day and time — you'll get instant confirmation and a reference code. If you'd rather describe the problem first, send a request instead."
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <BookingScheduler
              services={services.map((service) => ({
                slug: service.slug,
                name: service.name,
                shortDesc: service.shortDesc,
                durationMinutes: service.durationMinutes,
                delivery: service.delivery,
                priceFrom: service.priceFrom,
              }))}
              suburbs={suburbs}
              dates={dates}
              initialService={services.some((service) => service.slug === requestedService) ? requestedService : undefined}
              policyNote={settings.schedPolicyNote}
            />
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink">How it works</h2>
              <ol className="mt-4 space-y-3 text-sm">
                {[
                  "Pick your service, day and time.",
                  "Confirm your details — the slot is booked instantly.",
                  "You get a confirmation email with a reference and a cancel link.",
                  "We attend or connect at the agreed time, with a fixed quote first.",
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

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink">Prefer to send a request?</h2>
              <p className="mt-2 text-sm leading-relaxed">
                If you&apos;re not sure when you&apos;re free, or think the job needs a proper look first, send us the details and
                we&apos;ll suggest a time.
              </p>
              <Link href="/book/request" className="btn-outline btn-small mt-4">
                Send a request instead
              </Link>
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
