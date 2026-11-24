"use client";

import { useFormStatus } from "react-dom";

export interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "accent" | "outline";
  className?: string;
}

/** Form submit button that shows a pending state — used across the admin. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === "accent" ? "btn-accent" : variant === "outline" ? "btn-outline" : "btn-primary";

  return (
    <button type="submit" disabled={pending} className={`${variantClass} btn-small ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
