"use client";

import { STATUS_LABELS } from "@/lib/statuses";

export interface StatusSelectProps {
  /** Server action that saves the new status. */
  action: (formData: FormData) => Promise<void>;
  /** Name of the hidden id field, e.g. "id" or "jobId". */
  idName: string;
  idValue: number;
  status: string;
  options: readonly string[];
  /** Extra hidden fields, e.g. { kind: "booking" }. */
  hidden?: Record<string, string>;
  label?: string;
}

/**
 * Status dropdown that saves instantly via a server action.
 * With JavaScript on, choosing a status submits the form; without it, the
 * "Save" button still works.
 */
export function StatusSelect({
  action,
  idName,
  idValue,
  status,
  options,
  hidden = {},
  label = "Status",
}: StatusSelectProps) {
  const selectId = `status-${idName}-${idValue}`;

  return (
    <form action={action} className="flex items-center gap-1.5">
      <input type="hidden" name={idName} value={idValue} />
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label className="sr-only" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line bg-card px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option] ?? option}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn-outline btn-small">
          Save
        </button>
      </noscript>
    </form>
  );
}
