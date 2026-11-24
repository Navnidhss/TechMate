import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { updateJob } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { DELIVERY_LABELS, JOB_STATUSES, STATUS_LABELS, TIME_LABELS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Job details", robots: { index: false, follow: false } };

interface JobPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminJobPage({ params, searchParams }: JobPageProps) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId <= 0) notFound();

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { booking: true } });
  if (!job) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/jobs" className="text-xs font-semibold text-primary hover:text-primary-dark">
          ← Back to jobs
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">
            Job <span className="font-mono">{job.reference}</span>
          </h1>
          <StatusBadge status={job.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          Created {formatDateTime(job.createdAt)} · Last updated {formatDateTime(job.updatedAt)}
        </p>
      </div>

      {saved && (
        <div role="status" className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          Job saved. {job.customerEmail ? "The customer has been emailed the update." : ""}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Customer</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Name</dt>
                <dd className="text-ink">{job.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
                <dd className="break-all">
                  <a href={`mailto:${job.customerEmail}`} className="text-primary hover:text-primary-dark">
                    {job.customerEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
                <dd>
                  {job.customerPhone ? (
                    <a href={`tel:${job.customerPhone.replace(/[^0-9+]/g, "")}`} className="text-primary hover:text-primary-dark">
                      {job.customerPhone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Suburb</dt>
                <dd>{job.suburb ?? "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink">Work</h2>
            <p className="mt-2 text-sm">{job.serviceSummary}</p>

            {job.booking && (
              <div className="mt-4 border-t border-line pt-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">From booking</p>
                <p className="mt-1.5">
                  {DELIVERY_LABELS[job.booking.delivery] ?? job.booking.delivery}
                  {" · "}
                  {TIME_LABELS[job.booking.preferredTime] ?? job.booking.preferredTime}
                  {job.booking.preferredDate ? ` · ${job.booking.preferredDate}` : ""}
                </p>
                {job.booking.address && <p className="mt-1 text-body">Address: {job.booking.address}</p>}
                <p className="mt-1 whitespace-pre-wrap text-body">{job.booking.notes}</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 text-sm">
            <h2 className="font-display text-base font-bold text-ink">Customer tracking</h2>
            <p className="mt-1.5 leading-relaxed">
              The customer enters <span className="font-mono font-semibold">{job.reference}</span> on the tracking page to see
              the status and the customer update below. Nobody else&apos;s details are ever shown.
            </p>
          </section>
        </div>

        <form action={updateJob} className="space-y-4">
          <input type="hidden" name="jobId" value={job.id} />

          <section className="card p-5">
            <label htmlFor="status" className="field-label">
              Job status
            </label>
            <select id="status" name="status" defaultValue={job.status} className="select max-w-xs">
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] ?? status}
                </option>
              ))}
            </select>
            <p className="field-hint">This status appears next to the reference on the tracking page.</p>
          </section>

          <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
            <label htmlFor="statusNote" className="field-label">
              Customer update <span className="font-normal text-primary">(emailed + shown on tracking page)</span>
            </label>
            <textarea
              id="statusNote"
              name="statusNote"
              rows={4}
              defaultValue={job.statusNote}
              maxLength={1000}
              className="textarea"
            />
            <p className="field-hint">
              Plain English, please. This is exactly what the customer sees. Saving a changed status or update emails it to
              them automatically.
            </p>
          </section>

          <section className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
            <label htmlFor="adminNote" className="field-label">
              Private notes <span className="font-normal text-accent-dark">(never shown to the customer)</span>
            </label>
            <textarea
              id="adminNote"
              name="adminNote"
              rows={4}
              defaultValue={job.adminNote}
              maxLength={2000}
              className="textarea"
            />
            <p className="field-hint">Parts ordered, phone call summaries, access details — anything for your eyes only.</p>
          </section>

          <div className="flex items-center gap-3">
            <SubmitButton pendingLabel="Saving job…">Save job</SubmitButton>
            <Link href="/admin/jobs" className="text-sm font-medium text-muted hover:text-ink">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
