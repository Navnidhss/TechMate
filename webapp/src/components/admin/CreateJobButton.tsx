import { createJobFromBooking } from "@/lib/actions/admin";

import { SubmitButton } from "./SubmitButton";

export interface CreateJobButtonProps {
  bookingId: number;
}

/** Turns a booking request into a tracked job (server-action form). */
export function CreateJobButton({ bookingId }: CreateJobButtonProps) {
  return (
    <form action={createJobFromBooking}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <SubmitButton variant="outline" pendingLabel="Creating…">
        Create job
      </SubmitButton>
    </form>
  );
}
