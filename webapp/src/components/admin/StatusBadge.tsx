import { STATUS_LABELS } from "@/lib/statuses";

const TONES: Record<string, string> = {
  new: "bg-accent/10 text-accent-dark border-accent/20",
  received: "bg-slate-100 text-slate-700 border-slate-200",
  contacted: "bg-sky-50 text-sky-700 border-sky-200",
  assessing: "bg-sky-50 text-sky-700 border-sky-200",
  quoted: "bg-violet-50 text-violet-700 border-violet-200",
  confirmed: "bg-teal-50 text-teal-700 border-teal-200",
  "in-progress": "bg-teal-50 text-teal-700 border-teal-200",
  connected: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  recovered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "awaiting-parts": "bg-amber-50 text-amber-800 border-amber-200",
  "awaiting-customer": "bg-amber-50 text-amber-800 border-amber-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  declined: "bg-slate-100 text-slate-600 border-slate-200",
  unrecoverable: "bg-rose-50 text-rose-700 border-rose-200",
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const tone = TONES[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone} ${className}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
