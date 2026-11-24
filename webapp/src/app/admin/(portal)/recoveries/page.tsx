import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateSubmissionStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { DEVICE_TYPE_LABELS, IMPORTANCE_LABELS, RECOVERY_STATUSES } from "@/lib/statuses";

export const metadata: Metadata = { title: "Data recoveries" };

export default async function AdminRecoveriesPage() {
  const recoveries = await prisma.dataRecoveryIntake.findMany({ orderBy: { createdAt: "desc" } });

  const rows = recoveries.map((recovery) => ({
    id: recovery.id,
    createdAt: recovery.createdAt,
    title: recovery.name,
    contact: `${recovery.email} · ${recovery.phone}`,
    summary: `${DEVICE_TYPE_LABELS[recovery.deviceType] ?? recovery.deviceType} — ${recovery.symptoms}`,
    status: recovery.status,
    details: [
      { label: "Email", value: recovery.email },
      { label: "Phone", value: recovery.phone },
      { label: "Device", value: DEVICE_TYPE_LABELS[recovery.deviceType] ?? recovery.deviceType },
      { label: "Make / model", value: recovery.deviceMake ?? "—" },
      { label: "Importance", value: IMPORTANCE_LABELS[recovery.importance] ?? recovery.importance },
      { label: "What happened", value: recovery.symptoms },
      { label: "Already opened / attempted recovery", value: recovery.tampered ? "Yes" : "No" },
      { label: "Data handling consent", value: recovery.consent ? "Accepted" : "Not accepted" },
    ],
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Data recovery"
        description="Intake forms from the data recovery page. Remember: free assessment, and no recovery fee if the data can't be saved."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {recoveries.length} total
        </span>
      </AdminPageHeader>

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="Data recovery intake forms will appear here."
        renderStatus={(row) => (
          <StatusSelect
            action={updateSubmissionStatus}
            idName="id"
            idValue={row.id}
            status={row.status}
            options={RECOVERY_STATUSES}
            hidden={{ kind: "recovery" }}
            label="Recovery status"
          />
        )}
      />
    </div>
  );
}
