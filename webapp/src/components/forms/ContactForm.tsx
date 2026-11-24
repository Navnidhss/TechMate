"use client";

import { submitEnquiry } from "@/lib/actions/public";

import { FormAlert } from "./FormAlert";
import { FormInput } from "./FormInput";
import { FormSuccess } from "./FormSuccess";
import { FormTextarea } from "./FormTextarea";
import { usePublicForm } from "./usePublicForm";

export function ContactForm() {
  const { result, pending, onSubmit } = usePublicForm(submitEnquiry);

  if (result?.ok) {
    return (
      <FormSuccess
        title="Message received"
        message={result.message ?? "Thanks — your message is with us and we'll reply personally soon."}
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
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="0400 000 000"
        error={fieldErrors.phone}
        hint="Add a number if you'd prefer a call back."
      />

      <FormInput
        name="subject"
        label="What's it about?"
        required
        placeholder="e.g. Printer won't connect to my laptop"
        error={fieldErrors.subject}
      />

      <FormTextarea
        name="message"
        label="Your message"
        required
        placeholder="Tell us what's happening, in your own words. No technical detail needed."
        error={fieldErrors.message}
      />

      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-muted">
        We only use your details to reply to you. See our{" "}
        <a href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
          privacy page
        </a>
        .
      </p>
    </form>
  );
}
