"use client";

import { submitRemoteSupport } from "@/lib/actions/public";
import { URGENCY_OPTIONS } from "@/lib/statuses";

import { FormAlert } from "./FormAlert";
import { FormInput } from "./FormInput";
import { FormRadioGroup } from "./FormRadioGroup";
import { FormSuccess } from "./FormSuccess";
import { FormTextarea } from "./FormTextarea";
import { usePublicForm } from "./usePublicForm";

const URGENCY_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  today: "Today, if you can",
  "this-week": "Sometime this week",
};

export function RemoteSupportForm() {
  const { result, pending, onSubmit } = usePublicForm(submitRemoteSupport);

  if (result?.ok) {
    return (
      <FormSuccess
        title="Remote support request received"
        message={result.message ?? "Thanks — we've got your remote support request and will be in touch soon."}
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
        hint="We'll call or text when we're ready to connect."
      />

      <FormTextarea
        name="issue"
        label="What's the problem?"
        required
        placeholder="For example: 'My email won't send and a pop-up keeps appearing when I open the browser.'"
        error={fieldErrors.issue}
      />

      <FormRadioGroup
        name="urgency"
        legend="How urgent is it?"
        options={URGENCY_OPTIONS.map((option) => ({ value: option, label: URGENCY_LABELS[option] }))}
        error={fieldErrors.urgency}
      />

      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Request remote help"}
      </button>
      <p className="text-xs text-muted">
        We&apos;ll ask for your AnyDesk ID when we connect — you stay in control the whole time.
      </p>
    </form>
  );
}
