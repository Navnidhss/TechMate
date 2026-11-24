"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormAlert } from "@/components/forms/FormAlert";
import { FormInput } from "@/components/forms/FormInput";
import { changePassword } from "@/lib/actions/admin";

export interface ChangePasswordFormProps {
  mustChange: boolean;
}

export function ChangePasswordForm({ mustChange }: ChangePasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await changePassword(formData);
      if (result.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(result.error ?? null);
      setFieldErrors(result.fieldErrors ?? {});
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <FormAlert message={error} />}

      <FormInput
        name="currentPassword"
        label={mustChange ? "Temporary password" : "Current password"}
        type="password"
        autoComplete="current-password"
        required
        error={fieldErrors.currentPassword}
      />
      <FormInput
        name="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.newPassword}
        hint="At least 10 characters. A short phrase you'll remember works well."
      />
      <FormInput
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : mustChange ? "Save and continue" : "Update password"}
      </button>
    </form>
  );
}
