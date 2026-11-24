"use client";

import { cancelAppointmentAdmin } from "@/lib/actions/admin-calendar";

import { SubmitButton } from "./SubmitButton";

export interface AdminCancelAppointmentButtonProps {
  id: number;
  reference: string;
}

/** Cancel with a confirmation dialog (the customer is emailed and the slot freed). */
export function AdminCancelAppointmentButton({ id, reference }: AdminCancelAppointmentButtonProps) {
  return (
    <form
      action={cancelAppointmentAdmin}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Cancel booking ${reference}?\n\nThe customer will be emailed and the time will be freed on the website.`,
        );
        if (!ok) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="outline" pendingLabel="Cancelling…">
        Cancel booking
      </SubmitButton>
    </form>
  );
}
