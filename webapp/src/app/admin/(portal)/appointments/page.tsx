import type { Metadata } from "next";

import { AdminBanner } from "@/components/admin/AdminBanner";
import { AdminCancelAppointmentButton } from "@/components/admin/AdminCancelAppointmentButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { DELIVERY_LABELS } from "@/lib/statuses";
import { perthFriendlyDate, perthTimeLabel } from "@/lib/time";

export const metadata: Metadata = { title: "Appointments" };

interface AppointmentsPageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminAppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const { saved, error } = await searchParams;
  const appointments = await prisma.appointment.findMany({ orderBy: { startsAt: "desc" } });

  const now = Date.now();
  const sorted = [...appointments].sort((a, b) => {
    const aUpcoming = a.startsAt.getTime() >= now && a.status === "booked";
    const bUpcoming = b.startsAt.getTime() >= now && b.status === "booked";
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return aUpcoming
      ? a.startsAt.getTime() - b.startsAt.getTime()
      : b.startsAt.getTime() - a.startsAt.getTime();
  });

  const upcomingCount = appointments.filter(
    (appointment) => appointment.status === "booked" && appointment.startsAt.getTime() >= now,
  ).length;

  const rows = sorted.map((appointment) => ({
    id: appointment.id,
    createdAt: appointment.createdAt,
    title: `${appointment.customerName} · ${appointment.reference}`,
    contact: `${appointment.customerEmail} · ${appointment.customerPhone}`,
    summary: `${perthFriendlyDate(appointment.startsAt)}, ${perthTimeLabel(
      appointment.startsAt,
    )}–${perthTimeLabel(appointment.endsAt)} · ${appointment.serviceName} · ${
      DELIVERY_LABELS[appointment.delivery] ?? appointment.delivery
    }`,
    status: appointment.status,
    details: [
      { label: "When", value: `${formatDateTime(appointment.startsAt)} – ${perthTimeLabel(appointment.endsAt)}` },
      { label: "Service", value: `${appointment.serviceName} (${appointment.durationMinutes} min)` },
      { label: "Delivery", value: DELIVERY_LABELS[appointment.delivery] ?? appointment.delivery },
      { label: "Suburb", value: appointment.suburb },
      { label: "Address", value: appointment.address ?? "—" },
      { label: "Notes", value: appointment.notes || "—" },
      { label: "Reference", value: appointment.reference },
      { label: "Cancelled by", value: appointment.cancelledBy ?? "—" },
      { label: "Google event", value: appointment.googleEventId ? "Synced" : "Not synced" },
    ],
    action:
      appointment.status === "booked" ? (
        <AdminCancelAppointmentButton id={appointment.id} reference={appointment.reference} />
      ) : undefined,
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Appointments"
        description="Live bookings from the scheduler. Upcoming bookings appear first. Cancelling frees the slot and emails the customer."
      >
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark">
          {upcomingCount} upcoming
        </span>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {appointments.length} total
        </span>
      </AdminPageHeader>

      <AdminBanner saved={saved === "cancelled" ? "Booking cancelled — the slot is free again." : saved} error={error} />

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="Live bookings will appear here as soon as a customer picks a time."
        renderStatus={(row) => {
          const appointment = appointments.find((candidate) => candidate.id === row.id);
          return (
            <span
              className={`text-[11px] font-semibold ${
                appointment?.googleEventId ? "text-success" : "text-muted"
              }`}
              title={appointment?.googleEventId ? "This booking is in Google Calendar" : "Not in Google Calendar"}
            >
              {appointment?.googleEventId ? "✔ Google" : "— Google"}
            </span>
          );
        }}
      />

      <p className="text-xs text-muted">
        Deleting the event directly in Google Calendar also cancels it here — the sync notices within about 5 minutes (or
        press “Sync now” on the Calendar page). Editing the time of an event in Google does not move the booking; cancel it
        here and ask the customer to rebook.
      </p>

      <div className="rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-body">
        <p className="font-semibold text-ink">Tip</p>
        <p className="mt-1">
          Customers can cancel themselves from the link in their confirmation email. Either way, the time becomes bookable
          again immediately.
        </p>
      </div>
    </div>
  );
}
