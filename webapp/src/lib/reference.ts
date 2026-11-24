import crypto from "crypto";

import { prisma } from "@/lib/db";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1

export function newJobReference(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `TM-${code}`;
}

/** Generate a reference that isn't already in use (max 3 attempts). */
export async function uniqueJobReference(): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = newJobReference();
    const existing = await prisma.job.findUnique({ where: { reference } });
    if (!existing) return reference;
  }
  throw new Error("Could not generate a unique job reference");
}

/** Appointment references share the job format but are checked against Appointment. */
export async function uniqueAppointmentReference(): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = newJobReference();
    const existing = await prisma.appointment.findUnique({ where: { reference } });
    if (!existing) return reference;
  }
  throw new Error("Could not generate a unique appointment reference");
}
