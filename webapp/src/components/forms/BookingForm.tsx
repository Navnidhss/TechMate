"use client";

import { submitBooking } from "@/lib/actions/public";
import { DELIVERY_OPTIONS, TIME_OPTIONS } from "@/lib/statuses";

import { FormAlert } from "./FormAlert";
import { FormInput } from "./FormInput";
import { FormRadioGroup } from "./FormRadioGroup";
import { FormSuccess } from "./FormSuccess";
import { FormTextarea } from "./FormTextarea";
import { usePublicForm } from "./usePublicForm";

export interface BookingFormProps {
  services: { slug: string; name: string }[];
  suburbs: string[];
  initialService?: string;
  preselectedServiceName?: string;
}

const DELIVERY_DESCRIPTIONS: Record<string, string> = {
  onsite: "We come to your home — best for Wi-Fi, printers and anything physical.",
  remote: "We connect to your screen with AnyDesk — quick and often same-day.",
  workshop: "Drop your device off — best for repairs and data recovery.",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8am–12pm)",
  afternoon: "Afternoon (12pm–5pm)",
  evening: "Evening (5pm–7pm)",
  flexible: "I'm flexible",
};

export function BookingForm({
  services,
  suburbs,
  initialService,
  preselectedServiceName,
}: BookingFormProps) {
  const { result, pending, onSubmit } = usePublicForm(submitBooking);

  if (result?.ok) {
    return (
      <FormSuccess
        title="Booking request received"
        message={result.message ?? "Thanks — we've got your booking request and will confirm by email soon."}
      />
    );
  }

  const fieldErrors = result?.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {result?.error && <FormAlert message={result.error} />}

      {preselectedServiceName && (
        <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary-dark">
          You&apos;re booking: <strong>{preselectedServiceName}</strong>
        </p>
      )}

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
          name="suburb"
          label="Suburb"
          required
          autoComplete="address-level2"
          list="suburb-list"
          placeholder="e.g. Joondalup"
          error={fieldErrors.suburb}
          hint="Start typing and pick yours from the list if it appears."
        />
        <datalist id="suburb-list">
          {suburbs.map((suburb) => (
            <option key={suburb} value={suburb} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="serviceSlug" className="field-label">
            Which service?<span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </label>
          <select
            id="serviceSlug"
            name="serviceSlug"
            defaultValue={initialService ?? ""}
            aria-invalid={fieldErrors.serviceSlug ? true : undefined}
            aria-describedby={fieldErrors.serviceSlug ? "serviceSlug-error" : undefined}
            className={`select ${fieldErrors.serviceSlug ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
          >
            <option value="">Please choose…</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
          {fieldErrors.serviceSlug && (
            <p id="serviceSlug-error" className="field-error">
              {fieldErrors.serviceSlug}
            </p>
          )}
        </div>

        <FormInput
          name="preferredDate"
          label="Preferred day (optional)"
          type="date"
          error={fieldErrors.preferredDate}
          hint="Not sure yet? Leave it blank and we'll sort a time together."
        />
      </div>

      <FormRadioGroup
        name="delivery"
        legend="How would you like us to help?"
        defaultValue="onsite"
        options={DELIVERY_OPTIONS.map((option) => ({
          value: option,
          label: option === "onsite" ? "Onsite" : option === "remote" ? "Remote" : "Workshop",
          description: DELIVERY_DESCRIPTIONS[option],
        }))}
        error={fieldErrors.delivery}
      />

      <FormRadioGroup
        name="preferredTime"
        legend="What time of day suits?"
        options={TIME_OPTIONS.map((option) => ({ value: option, label: TIME_LABELS[option] }))}
        error={fieldErrors.preferredTime}
      />

      <FormInput
        name="address"
        label="Address (optional)"
        autoComplete="street-address"
        error={fieldErrors.address}
        hint="Only needed for onsite visits — you can also share this when we confirm."
      />

      <FormTextarea
        name="notes"
        label="What's going wrong?"
        required
        placeholder="A sentence or two is plenty. For example: 'My laptop takes ages to start and keeps freezing when I open email.'"
        error={fieldErrors.notes}
        hint="No need to diagnose it yourself — just describe what you're seeing."
      />

      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Send booking request"}
      </button>
      <p className="text-xs text-muted">
        We only use your details to respond to your booking. No mailing lists, ever. See our{" "}
        <a href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
          privacy page
        </a>
        .
      </p>
    </form>
  );
}
