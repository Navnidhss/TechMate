"use client";

import { submitRecovery } from "@/lib/actions/public";
import { DEVICE_TYPES, IMPORTANCE_OPTIONS } from "@/lib/statuses";

import { FormAlert } from "./FormAlert";
import { FormCheckbox } from "./FormCheckbox";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSuccess } from "./FormSuccess";
import { FormTextarea } from "./FormTextarea";
import { usePublicForm } from "./usePublicForm";

const DEVICE_LABELS: Record<string, string> = {
  "desktop-pc": "Desktop computer",
  laptop: "Laptop",
  "external-drive": "External hard drive",
  "usb-stick": "USB stick",
  phone: "Phone or tablet",
  other: "Something else",
};

const IMPORTANCE_LABELS: Record<string, string> = {
  critical: "Critical — I really need these files back",
  important: "Important — they'd be very hard to replace",
  "nice-to-have": "Nice to have — but not the end of the world",
};

export function DataRecoveryForm() {
  const { result, pending, onSubmit } = usePublicForm(submitRecovery);

  if (result?.ok) {
    return (
      <FormSuccess
        title="Recovery request received"
        message={result.message ?? "Thanks — we've got your data recovery request and will review it carefully."}
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

      <div className="grid gap-4 sm:grid-cols-2">
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
        <FormInput
          name="deviceMake"
          label="Make and model (optional)"
          placeholder="e.g. Seagate 2TB, MacBook Air 2020"
          error={fieldErrors.deviceMake}
          hint="If you know it — don't worry if not."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          name="deviceType"
          label="What kind of device?"
          required
          options={DEVICE_TYPES.map((option) => ({ value: option, label: DEVICE_LABELS[option] }))}
          error={fieldErrors.deviceType}
        />
        <FormSelect
          name="importance"
          label="How important is the data?"
          required
          options={IMPORTANCE_OPTIONS.map((option) => ({ value: option, label: IMPORTANCE_LABELS[option] }))}
          error={fieldErrors.importance}
        />
      </div>

      <FormTextarea
        name="symptoms"
        label="What happened?"
        required
        placeholder="For example: 'My external drive makes a clicking noise and no longer shows up on my laptop. The photos are from my kids' first years.'"
        error={fieldErrors.symptoms}
        hint="Include anything you've tried already — it helps us avoid making things worse."
      />

      <FormCheckbox
        name="tampered"
        label="Someone has already opened the device or tried recovery software"
        hint="No judgement — it just helps us understand the situation."
      />

      <FormCheckbox
        name="consent"
        label={
          <>
            I understand this business will access the device to assess and recover my data, and I accept the{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-primary underline-offset-2 hover:underline">
              data handling terms
            </a>
            .
          </>
        }
        error={fieldErrors.consent}
      />

      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Start my recovery request"}
      </button>
      <p className="text-xs text-muted">
        Free assessment. If we can&apos;t recover your data, there&apos;s no recovery fee.
      </p>
    </form>
  );
}
