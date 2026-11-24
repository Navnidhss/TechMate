"use client";

import { useState } from "react";

import type { ActionResult } from "@/lib/actions/public";

/**
 * Small form-state hook shared by every public form.
 * Keeps a single result object and a pending flag — no form libraries needed.
 */
export function usePublicForm(action: (formData: FormData) => Promise<ActionResult>) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      const response = await action(new FormData(form));
      setResult(response);
      if (response.ok) form.reset();
    } catch (error) {
      console.error("[form] submit failed:", error);
      setResult({
        ok: false,
        error: "Something went wrong at our end. Please try again, or email us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return { result, pending, onSubmit };
}
