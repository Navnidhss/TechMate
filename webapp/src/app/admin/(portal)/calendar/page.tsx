import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { addScheduleBlock, deleteScheduleBlock, disconnectGoogle, forceSync } from "@/lib/actions/admin-calendar";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getConnection, isGoogleConfigured } from "@/lib/google-auth";
import { oauthRedirectUri } from "@/lib/google";
import { perthDateString } from "@/lib/time";

export const metadata: Metadata = { title: "Calendar" };

interface CalendarPageProps {
  searchParams: Promise<{
    connected?: string;
    disconnected?: string;
    synced?: string;
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
}

export default async function AdminCalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const today = perthDateString(new Date());
  const [connection, blocks] = await Promise.all([
    getConnection(),
    prisma.scheduleBlock.findMany({
      where: { date: { gte: today } },
      orderBy: [{ date: "asc" }],
    }),
  ]);
  const configured = isGoogleConfigured();

  const flash = params.error
    ? { type: "error" as const, message: decodeURIComponent(params.error) }
    : params.connected
      ? { type: "ok" as const, message: "Google Calendar connected. New bookings will appear there automatically." }
      : params.synced
        ? { type: "ok" as const, message: "Calendar synced. Availability is up to date." }
        : params.disconnected
          ? { type: "ok" as const, message: "Google Calendar disconnected. Bookings now use local availability only." }
          : params.saved === "block"
            ? { type: "ok" as const, message: "Day block added." }
            : params.deleted
              ? { type: "ok" as const, message: "Day block removed." }
              : null;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Calendar"
        description="Connect Google Calendar, add days off, and check that bookings are syncing. The website's live booking slots use this plus local appointments."
      >
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            connection ? "bg-emerald-50 text-emerald-700" : "bg-surface text-muted"
          }`}
        >
          {connection ? "Google connected" : "Local availability only"}
        </span>
      </AdminPageHeader>

      {flash && (
        <div
          role={flash.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            flash.type === "error"
              ? "border-danger/30 bg-danger/5 text-danger"
              : "border-success/30 bg-success/5 text-success"
          }`}
        >
          {flash.message}
        </div>
      )}

      <section className="card p-5">
        <h2 className="font-display text-base font-bold text-ink">Google Calendar</h2>

        {!configured && (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              Google Calendar isn&apos;t set up on this server yet, so bookings use <strong>local availability only</strong> —
              the scheduler keeps working, but bookings won&apos;t appear in your calendar and your existing Google events
              won&apos;t block slots.
            </p>
            <p className="text-muted">
              To connect: follow <span className="font-mono text-xs">docs/CALENDAR_SETUP.md</span>, add the Google client ID and
              secret to <span className="font-mono text-xs">.env</span>, restart the app, and reload this page.
            </p>
          </div>
        )}

        {configured && !connection && (
          <div className="mt-3 space-y-3 text-sm">
            <p>Credentials are configured. Connect your Google account to start two-way syncing.</p>
            <p className="text-xs text-muted">
              After connecting, events on your primary calendar block customer slots, and new bookings appear in your
              calendar automatically.
            </p>
            <a href="/admin/calendar/connect" className="btn-primary btn-small">
              Connect Google Calendar
            </a>
          </div>
        )}

        {configured && connection && (
          <div className="mt-3 space-y-3 text-sm">
            <p>
              Connected as <strong>{connection.googleEmail}</strong>.
            </p>
            <p className="text-xs text-muted">
              {connection.lastSyncedAt
                ? `Last synced ${formatDateTime(connection.lastSyncedAt)}.`
                : "Not synced yet — slots will sync on the next booking or when you press Sync now."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <form action={forceSync}>
                <SubmitButton pendingLabel="Syncing…">Sync now</SubmitButton>
              </form>
              <details className="inline-block rounded-xl border border-danger/20 bg-danger/5 px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-danger">Disconnect</summary>
                <form action={disconnectGoogle} className="mt-2">
                  <p className="text-xs text-body">
                    This removes the stored tokens. Bookings stay in the database and the site keeps working without Google.
                  </p>
                  <SubmitButton variant="outline" pendingLabel="Disconnecting…">
                    Yes, disconnect
                  </SubmitButton>
                </form>
              </details>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-ink">Known limitation</p>
          <p className="mt-1">
            If you move an event to a different time directly in Google Calendar, the website booking keeps the original time.
            Cancel the booking here and ask the customer to rebook. Deleting an event in Google does free the slot
            automatically (within about five minutes).
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-base font-bold text-ink">Days off &amp; blocked time</h2>
        <p className="mt-1 text-sm text-muted">
          Block a whole day or a window (for example a lunch break or public holiday). Customer slots disappear immediately.
        </p>

        <form action={addScheduleBlock} className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="block-date" className="field-label">Date</label>
            <input id="block-date" name="date" type="date" min={today} className="input" required />
          </div>
          <div>
            <label htmlFor="block-start" className="field-label">From (optional)</label>
            <input id="block-start" name="startTime" type="time" className="input" />
          </div>
          <div>
            <label htmlFor="block-end" className="field-label">To (optional)</label>
            <input id="block-end" name="endTime" type="time" className="input" />
          </div>
          <div>
            <label htmlFor="block-reason" className="field-label">Reason</label>
            <input
              id="block-reason"
              name="reason"
              maxLength={120}
              placeholder="e.g. Public holiday"
              className="input"
            />
          </div>
          <SubmitButton pendingLabel="Adding…">Add block</SubmitButton>
          <label className="flex items-center gap-2 text-sm sm:col-span-5">
            <input type="checkbox" name="allDay" defaultChecked className="h-4 w-4 accent-primary" />
            Block the whole day (untick and add times for a partial block)
          </label>
        </form>

        <div className="mt-5 border-t border-line pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Upcoming blocks</h3>
          {blocks.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No days blocked — your normal working hours apply.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {blocks.map((block) => (
                <li key={block.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold text-ink">
                      {block.date}
                      {block.allDay
                        ? " · all day"
                        : ` · ${block.startTime ?? "?"}–${block.endTime ?? "?"}`}
                    </p>
                    {block.reason && <p className="text-xs text-muted">{block.reason}</p>}
                  </div>
                  <form action={deleteScheduleBlock}>
                    <input type="hidden" name="id" value={block.id} />
                    <SubmitButton variant="outline" pendingLabel="Removing…">
                      Remove
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        OAuth redirect URI for this install: <span className="font-mono">{oauthRedirectUri()}</span> — this must match the
        Google Cloud console exactly.
      </p>
    </div>
  );
}
