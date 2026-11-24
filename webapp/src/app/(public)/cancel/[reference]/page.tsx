import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { CancelBookingForm } from "@/components/forms/CancelBookingForm";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { perthFriendlyDate, perthTimeLabel } from "@/lib/time";
import { tokensMatch } from "@/lib/tokens";
import { DELIVERY_LABELS } from "@/lib/statuses";

export const metadata: Metadata = {
  title: "Cancel a booking",
  robots: { index: false, follow: false },
};

interface CancelPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function CancelBookingPage({ params, searchParams }: CancelPageProps) {
  const [{ reference }, { token }, settings] = await Promise.all([params, searchParams, getSettings()]);
  const normalized = reference.toUpperCase();
  const appointment =
    /^TM-[A-HJKMNP-Z2-9]{6}$/.test(normalized)
      ? await prisma.appointment.findUnique({ where: { reference: normalized } })
      : null;

  const validLink = Boolean(appointment && token && tokensMatch(token, appointment.cancelToken));

  if (!validLink || !appointment) {
    return (
      <>
        <PageHero eyebrow="Booking" title="This link doesn't seem right" align="center" />
        <section className="section">
          <div className="container-page max-w-xl">
            <div className="card p-6 text-center sm:p-8">
              <p className="text-sm leading-relaxed">
                We couldn&apos;t confirm this cancellation link. It may have been typed incorrectly, or the booking may already
                have been dealt with.
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Email{" "}
                <a href={`mailto:${settings.contactEmail}`} className="font-semibold text-primary">
                  {settings.contactEmail}
                </a>{" "}
                or call {settings.contactPhone} and we&apos;ll sort it out.
              </p>
              <Link href="/" className="btn-outline btn-small mt-5">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const when = `${perthFriendlyDate(appointment.startsAt)}, ${perthTimeLabel(appointment.startsAt)}–${perthTimeLabel(
    appointment.endsAt,
  )}`;

  if (appointment.status !== "booked") {
    return (
      <>
        <PageHero eyebrow="Booking" title="This booking is no longer active" align="center" />
        <section className="section">
          <div className="container-page max-w-xl">
            <div className="card p-6 text-center sm:p-8">
              <p className="text-sm leading-relaxed">
                Booking <span className="font-mono font-semibold">{appointment.reference}</span> ({appointment.serviceName},{" "}
                {when}) isn&apos;t active, so there&apos;s nothing left to cancel.
              </p>
              <p className="mt-2 text-sm">Need a new time? You can book again in a few clicks.</p>
              <Link href="/book" className="btn-primary btn-small mt-5">
                Book a new time
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Cancel booking"
        title="Cancel this booking?"
        intro="No hard feelings — we just need to confirm. This frees the time for someone else."
        align="center"
      />

      <section className="section">
        <div className="container-page max-w-xl">
          <div className="card p-6 sm:p-8">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-ink">Reference</dt>
                <dd className="font-mono">{appointment.reference}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-ink">When</dt>
                <dd className="text-right">{when}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-ink">Service</dt>
                <dd className="text-right">{appointment.serviceName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-ink">Delivery</dt>
                <dd className="text-right">{DELIVERY_LABELS[appointment.delivery] ?? appointment.delivery}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-line pt-5">
              <CancelBookingForm reference={appointment.reference} token={token ?? ""} />
            </div>
          </div>

          <p className="mt-5 text-center text-sm">
            Changed your mind?{" "}
            <Link href="/book" className="font-semibold text-primary hover:text-primary-dark">
              Pick a different time
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
