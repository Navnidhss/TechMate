import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateSubmissionStatus } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { BUDGET_LABELS, QUOTE_STATUSES } from "@/lib/statuses";

export const metadata: Metadata = { title: "Quote requests" };

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" } });

  const rows = quotes.map((quote) => ({
    id: quote.id,
    createdAt: quote.createdAt,
    title: quote.name,
    contact: `${quote.email} · ${quote.phone}`,
    summary: quote.details,
    status: quote.status,
    details: [
      { label: "Email", value: quote.email },
      { label: "Phone", value: quote.phone },
      { label: "Details", value: quote.details },
      { label: "Budget", value: quote.budget ? (BUDGET_LABELS[quote.budget] ?? quote.budget) : "Not specified" },
    ],
  }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quote requests"
        description="Jobs customers want priced. Reply with a fixed quote, then mark the request quoted or accepted."
      >
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
          {quotes.length} total
        </span>
      </AdminPageHeader>

      <DataTable
        rows={rows}
        timestamp={formatDateTime}
        emptyMessage="Quote requests will appear here."
        renderStatus={(row) => (
          <StatusSelect
            action={updateSubmissionStatus}
            idName="id"
            idValue={row.id}
            status={row.status}
            options={QUOTE_STATUSES}
            hidden={{ kind: "quote" }}
            label="Quote status"
          />
        )}
      />
    </div>
  );
}
