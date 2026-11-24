import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Admin dashboard" };

interface RecentItem {
  key: string;
  name: string;
  label: string;
  status: string;
  createdAt: Date;
  href: string;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [newBookings, newEnquiries, newRecoveries, activeJobs, upcomingAppointments] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: "new" } }),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.dataRecoveryIntake.count({ where: { status: "new" } }),
    prisma.job.count({ where: { status: { notIn: ["completed", "cancelled"] } } }),
    prisma.appointment.count({
      where: { status: "booked", startsAt: { gte: now, lte: nextWeek } },
    }),
  ]);

  const [bookings, enquiries, quotes, recoveries, remote] = await Promise.all([
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.dataRecoveryIntake.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.remoteSupportRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const recent: RecentItem[] = [
    ...bookings.map((item) => ({
      key: `booking-${item.id}`,
      name: item.name,
      label: "Booking",
      status: item.status,
      createdAt: item.createdAt,
      href: "/admin/bookings",
    })),
    ...enquiries.map((item) => ({
      key: `enquiry-${item.id}`,
      name: item.name,
      label: "Enquiry",
      status: item.status,
      createdAt: item.createdAt,
      href: "/admin/enquiries",
    })),
    ...quotes.map((item) => ({
      key: `quote-${item.id}`,
      name: item.name,
      label: "Quote request",
      status: item.status,
      createdAt: item.createdAt,
      href: "/admin/quotes",
    })),
    ...recoveries.map((item) => ({
      key: `recovery-${item.id}`,
      name: item.name,
      label: "Data recovery",
      status: item.status,
      createdAt: item.createdAt,
      href: "/admin/recoveries",
    })),
    ...remote.map((item) => ({
      key: `remote-${item.id}`,
      name: item.name,
      label: "Remote support",
      status: item.status,
      createdAt: item.createdAt,
      href: "/admin/remote",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const counts = [
    { label: "New bookings", value: newBookings, href: "/admin/bookings", tone: "text-primary" },
    { label: "New enquiries", value: newEnquiries, href: "/admin/enquiries", tone: "text-sky-700" },
    { label: "New recoveries", value: newRecoveries, href: "/admin/recoveries", tone: "text-accent-dark" },
    { label: "Active jobs", value: activeJobs, href: "/admin/jobs", tone: "text-emerald-700" },
    {
      label: "Appointments (7 days)",
      value: upcomingAppointments,
      href: "/admin/appointments",
      tone: "text-accent-dark",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Everything that needs your attention, in one place. Listings show the latest five.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card p-5 transition-colors hover:border-primary/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{card.label}</p>
            <p className={`mt-2 font-display text-3xl font-bold ${card.tone}`}>{card.value}</p>
            <p className="mt-1 text-xs text-muted">Tap to manage →</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-bold text-ink">Latest activity</h2>
            <p className="text-xs text-muted">Newest requests across all forms</p>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No submissions yet — they&apos;ll appear here as soon as a customer gets in touch.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-surface"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {item.name} <span className="font-normal text-muted">· {item.label}</span>
                      </p>
                      <p className="text-xs text-muted">{formatDateTime(item.createdAt)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Quick links</h2>
            <div className="mt-3 grid gap-1.5 text-sm">
              {[
                { href: "/admin/jobs", label: "Manage jobs and tracking codes" },
                { href: "/admin/appointments", label: "See live appointments" },
                { href: "/admin/calendar", label: "Connect Google Calendar / add days off" },
                { href: "/admin/content/services", label: "Edit services and prices" },
                { href: "/admin/content/faq", label: "Edit the FAQs" },
                { href: "/admin/content/areas", label: "Edit suburbs we cover" },
                { href: "/admin/content/settings", label: "Change contact details and emails" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2.5 py-2 font-medium text-body hover:bg-surface hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-primary/5 p-5 text-sm">
            <h2 className="font-display text-base font-bold text-ink">Remember</h2>
            <p className="mt-1.5 leading-relaxed">
              The “customer update” note on a job is emailed to the customer and shown on the tracking page. Keep internal
              notes in the private field.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
