import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateSubmissionStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { REMOTE_STATUSES, URGENCY_LABELS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Remote support" };

export default async function AdminRemotePage() {
  const requests = await prisma.remoteSupportRequest.findMany({ orderBy: { createdAt: "desc" } });

  const rows = requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    title: request.name,
    contact: `${request.email} · ${request.phone}`,
    summary: `${URGENCY_LABELS[request.urgency] ?? request.urgency} — ${request.issue}`,
    status: request.status,
    details: [
      { label: "Email", value: request.email },
      { label: "Phone", value: request.phone },
      { label: "Urgency", value: URGENCY_LABELS[request.urgency] ?? request.urgency },
      { label: "Issue", value: request.issue },
    ],
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Remote support"
        description="AnyDesk requests. When you're ready to connect, ask the customer for their 9-digit ID."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {requests.length} total
        </span>
      </AdminPageHeader>

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="Remote support requests will appear here."
        renderStatus={(row) => (
          <StatusSelect
            action={updateSubmissionStatus}
            idName="id"
            idValue={row.id}
            status={row.status}
            options={REMOTE_STATUSES}
            hidden={{ kind: "remote" }}
            label="Remote request status"
          />
        )}
      />
    </div>
  );
}
