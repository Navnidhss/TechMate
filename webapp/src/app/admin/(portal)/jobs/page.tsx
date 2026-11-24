import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateJobStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { JOB_STATUSES } from "@/lib/statuses";

export const metadata: Metadata = { title: "Jobs" };

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { updatedAt: "desc" },
    include: { booking: true },
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Jobs"
        description="Tracked repairs and visits. Each job has a customer-facing reference code they can use on the tracking page."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {jobs.length} total
        </span>
      </AdminPageHeader>

      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-base font-semibold text-ink">No jobs yet</p>
          <p className="mt-1 text-sm text-muted">
            Create one from a booking request and it will get a unique tracking code automatically.
          </p>
          <Link href="/admin/bookings" className="btn-primary btn-small mt-4">
            Go to bookings
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden border-b border-line bg-surface px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted sm:grid sm:grid-cols-[1fr_1.4fr_1.4fr_auto_auto] sm:gap-4">
            <span>Reference</span>
            <span>Customer</span>
            <span>Work</span>
            <span>Updated</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-line">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[1fr_1.4fr_1.4fr_auto_auto] sm:items-center sm:gap-4 sm:px-5"
              >
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="font-mono text-sm font-bold text-primary hover:text-primary-dark"
                >
                  {job.reference}
                </Link>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{job.customerName}</p>
                  <p className="truncate text-xs text-muted">
                    {job.customerEmail}
                    {job.suburb ? ` · ${job.suburb}` : ""}
                  </p>
                </div>
                <p className="truncate text-sm text-body">{job.serviceSummary}</p>
                <p className="text-xs text-muted">{formatDateTime(job.updatedAt)}</p>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <StatusBadge status={job.status} />
                  <StatusSelect
                    action={updateJobStatus}
                    idName="jobId"
                    idValue={job.id}
                    status={job.status}
                    options={JOB_STATUSES}
                    label={`Status for ${job.reference}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        Changing a status here emails the customer the current customer update. To write a new update, open the job.
      </p>
    </div>
  );
}
