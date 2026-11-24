import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateJobButton } from "@/components/admin/CreateJobButton";
import { DataTable } from "@/components/admin/DataTable";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateSubmissionStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { BOOKING_STATUSES, DELIVERY_LABELS, TIME_LABELS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const [bookings, services] = await Promise.all([
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, include: { job: true } }),
    prisma.service.findMany(),
  ]);
  const serviceNames = new Map(services.map((service) => [service.slug, service.name]));

  const rows = bookings.map((booking) => ({
    id: booking.id,
    createdAt: booking.createdAt,
    title: booking.name,
    contact: `${booking.email} · ${booking.phone}`,
    summary: [
      serviceNames.get(booking.serviceSlug) ?? booking.serviceSlug,
      booking.suburb,
      DELIVERY_LABELS[booking.delivery] ?? booking.delivery,
    ].join(" · "),
    status: booking.status,
    details: [
      { label: "Email", value: booking.email },
      { label: "Phone", value: booking.phone },
      { label: "Suburb", value: booking.suburb },
      { label: "Service", value: serviceNames.get(booking.serviceSlug) ?? booking.serviceSlug },
      { label: "Delivery", value: DELIVERY_LABELS[booking.delivery] ?? booking.delivery },
      { label: "Preferred day", value: booking.preferredDate ?? "No preference" },
      { label: "Preferred time", value: TIME_LABELS[booking.preferredTime] ?? booking.preferredTime },
      { label: "Address", value: booking.address ?? "—" },
      { label: "Notes", value: booking.notes },
      { label: "Job", value: booking.job ? `${booking.job.reference}` : "Not created yet" },
    ],
    action: booking.job ? (
      <Link
        href={`/admin/jobs/${booking.job.id}`}
        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary/40"
      >
        {booking.job.reference}
      </Link>
    ) : (
      <CreateJobButton bookingId={booking.id} />
    ),
  }));

  const newCount = bookings.filter((booking) => booking.status === "new").length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Bookings"
        description="Every booking request from the website. Update the status as you go, and create a job once a time is confirmed."
      >
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
          {newCount} new
        </span>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {bookings.length} total
        </span>
      </AdminPageHeader>

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="New booking requests will appear here as soon as customers send them."
        renderStatus={(row) => (
          <StatusSelect
            action={updateSubmissionStatus}
            idName="id"
            idValue={row.id}
            status={row.status}
            options={BOOKING_STATUSES}
            hidden={{ kind: "booking" }}
            label="Booking status"
          />
        )}
      />
    </div>
  );
}
