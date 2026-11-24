"use client";

import Link from "next/link";
import { useState } from "react";

import { FormAlert } from "@/components/forms/FormAlert";
import { Icon } from "@/components/Icon";
import { cancelAppointment } from "@/lib/actions/calendar";

export interface CancelBookingFormProps {
  reference: string;
  token: string;
}

export function CancelBookingForm({ reference, token }: CancelBookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [pending, setPending] = useState(false);

  async function onCancel() {
    setPending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("reference", reference);
      formData.append("token", token);
      const result = await cancelAppointment(formData);
      if (result.ok) {
        setCancelled(true);
      } else {
        setError(result.error ?? "We couldn't cancel this booking. Please contact us.");
      }
    } catch {
      setError("Something went wrong at our end. Please try again, or contact us.");
    } finally {
      setPending(false);
    }
  }

  if (cancelled) {
    return (
      <div className="text-center" aria-live="polite">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="check-circle" size={26} />
        </span>
        <h2 className="mt-3 font-display text-xl font-bold text-ink">It&apos;s cancelled</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Booking <span className="font-mono font-semibold">{reference}</span> has been cancelled and the time is free again.
          We&apos;ve sent you a confirmation email.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/book" className="btn-primary btn-small">
            Book a new time
          </Link>
          <Link href="/" className="btn-outline btn-small">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4">
          <FormAlert message={error} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void onCancel()} className="btn-primary" disabled={pending}>
          {pending ? "Cancelling…" : "Yes, cancel this booking"}
        </button>
        <Link href="/" className="btn-outline btn-small">
          Keep my booking
        </Link>
      </div>
    </div>
  );
}
