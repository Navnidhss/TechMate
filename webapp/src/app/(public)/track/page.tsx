import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { TrackForm } from "@/components/forms/TrackForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Track Your Repair",
  description:
    "Check the status of your TechMate repair using the reference code from your booking confirmation.",
};

export default async function TrackPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Job tracking"
        title="Where's my repair?"
        intro="Enter the reference code from your confirmation email to see the latest update."
        align="center"
      />

      <section className="section">
        <div className="container-page max-w-xl">
          <div className="card p-6 sm:p-8">
            <TrackForm />

            <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
              Tracking shows only the job status and the latest update — never your name, contact details or private notes.
              Need an update now? Email{" "}
              <a href={`mailto:${settings.contactEmail}`} className="font-semibold text-primary">
                {settings.contactEmail}
              </a>
              .
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            Lost your code?{" "}
            <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
              Contact us
            </Link>{" "}
            and we&apos;ll find your job.
          </p>
        </div>
      </section>

      <section className="border-t border-line bg-card py-12">
        <div className="container-page grid max-w-4xl gap-5 sm:grid-cols-3">
          {[
            { icon: "mail", title: "Check your email", text: "Your reference is in the subject line of your confirmation." },
            { icon: "clock", title: "Updates as they happen", text: "We email you when the status of your job changes." },
            { icon: "lock", title: "Private by default", text: "Tracking shows only the job status — never your personal details." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={item.icon} size={20} />
              </span>
              <h2 className="mt-3 font-display text-sm font-bold text-ink">{item.title}</h2>
              <p className="mt-1 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
