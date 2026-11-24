"use client";

import { useState } from "react";

import { FormAlert } from "@/components/forms/FormAlert";
import { FormInput } from "@/components/forms/FormInput";
import { login } from "@/lib/actions/admin";

export interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const result = await login(formData);
      if (result.ok) {
        window.location.assign(result.next ?? "/admin");
        return;
      }
      setError(result.error ?? "Incorrect username or password.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {error && <FormAlert message={error} />}

      <FormInput
        name="username"
        label="Username"
        autoComplete="username"
        required
        placeholder="admin"
      />
      <FormInput
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Your password"
      />

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
