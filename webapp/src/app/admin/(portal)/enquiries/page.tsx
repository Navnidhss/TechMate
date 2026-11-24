import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateSubmissionStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { ENQUIRY_STATUSES } from "@/lib/statuses";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });

  const rows = enquiries.map((enquiry) => ({
    id: enquiry.id,
    createdAt: enquiry.createdAt,
    title: enquiry.name,
    contact: [enquiry.email, enquiry.phone].filter(Boolean).join(" · "),
    summary: enquiry.subject,
    status: enquiry.status,
    details: [
      { label: "Email", value: enquiry.email },
      { label: "Phone", value: enquiry.phone ?? "—" },
      { label: "Subject", value: enquiry.subject },
      { label: "Message", value: enquiry.message },
    ],
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Enquiries"
        description="General messages from the contact form. Reply directly by email — the customer's address is in the details."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {enquiries.length} total
        </span>
      </AdminPageHeader>

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="Contact-form messages will appear here."
        renderStatus={(row) => (
          <StatusSelect
            action={updateSubmissionStatus}
            idName="id"
            idValue={row.id}
            status={row.status}
            options={ENQUIRY_STATUSES}
            hidden={{ kind: "enquiry" }}
            label="Enquiry status"
          />
        )}
      />
    </div>
  );
}
