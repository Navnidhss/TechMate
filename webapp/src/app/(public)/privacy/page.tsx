import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How TechMate looks after your personal information — what we collect, why, and how to ask us about it.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Your privacy, in plain English"
        intro="We keep things simple here too. This page explains what information we collect, why we need it, and how it's looked after."
      />

      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
            <p className="font-semibold text-ink">Draft policy — pending final review</p>
            <p className="mt-1 leading-relaxed">
              This is placeholder privacy text written for the initial build of the site. The business owner will review and
              finalise it before the site goes live.
            </p>
          </div>

          <div className="prose-plain mt-8 text-[15px]">
            <h2 className="font-display text-xl font-bold text-ink">What we collect</h2>
            <p>
              When you send us a booking, enquiry, quote request or data recovery form, we collect the details you choose to
              give us: your name, email address, phone number, suburb, and a description of the problem. If you book an onsite
              visit, you may also provide your address.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">Why we collect it</h2>
            <p>
              Only to respond to your enquiry, arrange and carry out the work, keep a record of the job, and follow up if needed.
              We don&apos;t use your details for unrelated marketing, and we don&apos;t sell or rent your information to anyone.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">How it&apos;s stored</h2>
            <p>
              Enquiry details are stored in a private database used only by the business, and enquiry notifications are sent by
              email (through Gmail) so we can reply quickly. Access is limited to the business owner. We keep records only as long
              as they&apos;re needed for the job and reasonable business records.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">Remote support and your device</h2>
            <p>
              During a remote session, we can only see your screen while you have the connection open and approved. You can watch
              everything we do and end the session at any time. We only access the parts of your device needed to fix the problem.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">Data recovery</h2>
            <p>
              Your data is treated as confidential. Recovered files are returned to you and any working copies we hold are securely
              deleted afterwards. We never browse personal files for any reason other than the recovery work you&apos;ve asked for.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">Cookies and tracking</h2>
            <p>
              The public website doesn&apos;t use advertising trackers or third-party analytics cookies. The admin area uses a
              single essential cookie to keep the business owner signed in.
            </p>

            <h2 className="font-display text-xl font-bold text-ink">Asking about your information</h2>
            <p>
              You can ask what information we hold about you, request a correction, or ask us to delete it. Email{" "}
              <a href={`mailto:${settings.contactEmail}`} className="font-semibold text-primary hover:text-primary-dark">
                {settings.contactEmail}
              </a>{" "}
              and we&apos;ll help. If you have a concern we can&apos;t resolve, you can contact the Office of the Australian
              Information Commissioner (OAIC).
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-card p-6">
            <p className="text-sm">
              Questions about this policy?{" "}
              <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
                Contact us
              </Link>{" "}
              — we&apos;re happy to explain.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
