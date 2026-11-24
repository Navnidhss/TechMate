"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormAlert } from "@/components/forms/FormAlert";
import { Icon } from "@/components/Icon";
import { lookupJob, type TrackResult } from "@/lib/actions/public";
import { formatDateTime } from "@/lib/format";

export function TrackForm() {
  const [result, setResult] = useState<TrackResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    try {
      const response = await lookupJob(formData);
      setResult(response);
      if (response.ok) form.reset();
    } catch {
      setResult({
        ok: false,
        error: "Something went wrong at our end. Please try again, or contact us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  const job = result?.ok ? result.job : undefined;

  return (
    <div>
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="reference" className="field-label">
          Your reference code
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="reference"
            name="reference"
            placeholder="TM-ABC123"
            className={`input font-mono uppercase tracking-wider ${
              result?.fieldErrors?.reference ? "border-danger" : ""
            }`}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={9}
            aria-invalid={result?.fieldErrors?.reference ? true : undefined}
            aria-describedby={result?.fieldErrors?.reference ? "reference-error" : "reference-hint"}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={pending}>
            {pending ? "Checking…" : "Check status"}
          </button>
        </div>
        {result?.fieldErrors?.reference && (
          <p id="reference-error" className="field-error">
            {result.fieldErrors.reference}
          </p>
        )}
        <p id="reference-hint" className="field-hint">
          Your code looks like <span className="font-mono">TM-</span> followed by six letters and numbers. It&apos;s in your
          confirmation email.
        </p>
      </form>

      {result?.error && (
        <div className="mt-5">
          <FormAlert message={result.error} />
        </div>
      )}

      {job && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Job reference</p>
              <p className="font-mono text-lg font-bold text-ink">{job.reference}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="mt-4 rounded-xl border border-primary/20 bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Latest update</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">{job.statusNote}</p>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <Icon name="clock" size={14} />
            Last updated {formatDateTime(new Date(job.updatedAt))}
          </p>
        </div>
      )}
    </div>
  );
}
