"use client";

import { submitQuote } from "@/lib/actions/public";
import { BUDGET_OPTIONS } from "@/lib/statuses";

import { FormAlert } from "./FormAlert";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSuccess } from "./FormSuccess";
import { FormTextarea } from "./FormTextarea";
import { usePublicForm } from "./usePublicForm";

const BUDGET_LABELS: Record<string, string> = {
  "under-500": "Under $500",
  "500-1000": "$500 – $1,000",
  "1000-2000": "$1,000 – $2,000",
  "not-sure": "Not sure yet",
};

export function QuoteForm() {
  const { result, pending, onSubmit } = usePublicForm(submitQuote);

  if (result?.ok) {
    return (
      <FormSuccess
        title="Quote request received"
        message={result.message ?? "Thanks — we've got your quote request and will come back with a fixed price soon."}
      />
    );
  }

  const fieldErrors = result?.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {result?.error && <FormAlert message={result.error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="name"
          label="Your name"
          required
          autoComplete="name"
          placeholder="e.g. Jenny Smith"
          error={fieldErrors.name}
        />
        <FormInput
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
        />
      </div>

      <FormInput
        name="phone"
        label="Phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
        placeholder="0400 000 000"
        error={fieldErrors.phone}
      />

      <FormTextarea
        name="details"
        label="What would you like quoted?"
        required
        placeholder="For example: 'My laptop screen is cracked — a 2021 HP Pavilion. What would a replacement cost?'"
        error={fieldErrors.details}
      />

      <FormSelect
        name="budget"
        label="Rough budget (optional)"
        options={BUDGET_OPTIONS.map((option) => ({ value: option, label: BUDGET_LABELS[option] }))}
        error={fieldErrors.budget}
        hint="A guide only — it helps us suggest sensible options."
      />

      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Request my quote"}
      </button>
      <p className="text-xs text-muted">
        Free, no obligation. We only use your details to prepare and discuss the quote. See our{" "}
        <a href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
          privacy page
        </a>
        .
      </p>
    </form>
  );
}
