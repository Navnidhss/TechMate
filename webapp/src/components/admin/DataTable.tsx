import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";

export interface DataTableRow {
  id: number;
  createdAt: Date;
  title: string;
  contact: string;
  summary: string;
  status: string;
  details: { label: string; value: string }[];
  action?: ReactNode;
}

export interface DataTableProps {
  rows: DataTableRow[];
  /** Rendered next to the status badge, e.g. the instant-save dropdown. */
  renderStatus: (row: DataTableRow) => ReactNode;
  emptyMessage: string;
  timestamp: (date: Date) => string;
}

/**
 * Shared submission list for bookings, enquiries, quotes, recoveries and
 * remote requests. Dense and scannable, with full details one click away.
 */
export function DataTable({ rows, renderStatus, emptyMessage, timestamp }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-base font-semibold text-ink">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card divide-y divide-line overflow-hidden">
      {rows.map((row) => (
        <article key={row.id} className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm font-bold text-ink">{row.title}</h3>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {timestamp(row.createdAt)} · {row.contact}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {row.action}
              {renderStatus(row)}
            </div>
          </div>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-body">{row.summary}</p>

          <details className="group mt-2">
            <summary className="cursor-pointer list-none text-xs font-semibold text-primary hover:text-primary-dark">
              View full details
            </summary>
            <dl className="mt-2 grid gap-1.5 rounded-xl bg-surface p-3 text-xs sm:grid-cols-2">
              {row.details.map((detail) => (
                <div key={detail.label} className="flex gap-1.5">
                  <dt className="shrink-0 font-semibold text-ink">{detail.label}:</dt>
                  <dd className="whitespace-pre-wrap text-body">{detail.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </details>
        </article>
      ))}
    </div>
  );
}
