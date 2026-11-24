import { z } from "zod";

import {
  BUDGET_OPTIONS,
  DELIVERY_OPTIONS,
  DEVICE_TYPES,
  IMPORTANCE_OPTIONS,
  TIME_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/statuses";

/**
 * All form validation lives here, shared by client forms and server actions.
 * Every message is written for a non-technical customer — no "invalid input".
 */

const name = z
  .string()
  .trim()
  .min(2, "Please tell us your name")
  .max(80, "That name is a little too long");

const email = z
  .string()
  .trim()
  .min(1, "Please add your email address")
  .max(120, "That email address is too long")
  .email("Please check your email address — it doesn't look quite right");

const phone = z
  .string()
  .trim()
  .regex(/^[0-9 ()+.-]{8,20}$/, "Please add a phone number we can reach you on");

const optionalPhone = optional(z
  .string()
  .trim()
  .regex(/^[0-9 ()+.-]{8,20}$/, "Please check your phone number — it doesn't look quite right"));

const suburb = z
  .string()
  .trim()
  .min(2, "Please tell us your suburb")
  .max(60, "That suburb name is a little too long");

/** Turn blank optional fields from a form into `undefined`. */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );
}

/** Checkboxes arrive as "on" when ticked and are missing otherwise. */
const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const shortMessage = (min: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `Please ${label} — at least ${min} characters helps us understand`)
    .max(5000, "That's a little long for us to read — please shorten it");

const bookingBase = z.object({
  name,
  email,
  phone,
  suburb,
  serviceSlug: z.string().trim().min(1, "Please choose a service"),
  delivery: z.enum(DELIVERY_OPTIONS, { message: "Please choose how you'd like us to help" }),
  preferredDate: optional(
    z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Please use the date picker for your preferred day"),
  ),
  preferredTime: z.enum(TIME_OPTIONS, { message: "Please pick a time that suits you" }),
  address: optional(z.string().trim().max(200, "That address is a little too long")),
  notes: shortMessage(10, "describe the problem"),
});

export const bookingSchema = bookingBase;

export const enquirySchema = z.object({
  name,
  email,
  phone: optionalPhone,
  subject: z
    .string()
    .trim()
    .min(5, "Please add a short subject so we know what it's about")
    .max(120, "That subject is a little too long"),
  message: shortMessage(10, "write us a message"),
});

export const quoteSchema = z.object({
  name,
  email,
  phone,
  details: shortMessage(10, "describe what you need quoted"),
  budget: optional(z.enum(BUDGET_OPTIONS, { message: "Please choose a budget range" })),
});

export const recoverySchema = z.object({
  name,
  email,
  phone,
  deviceType: z.enum(DEVICE_TYPES, { message: "Please choose the type of device" }),
  deviceMake: optional(z.string().trim().max(80, "That's a little too long")),
  importance: z.enum(IMPORTANCE_OPTIONS, { message: "Please tell us how important the data is" }),
  symptoms: shortMessage(10, "describe what happened to the device"),
  tampered: checkbox,
  consent: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean().refine((value) => value === true, "Please accept the data handling terms"),
  ),
});

export const remoteSupportSchema = z.object({
  name,
  email,
  phone,
  issue: shortMessage(10, "describe the problem"),
  urgency: z.enum(URGENCY_OPTIONS, { message: "Please tell us how urgent it is" }),
});

/** Job tracking code: TM- followed by six characters (no I, O, 0 or 1). */
export const trackReferenceSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^TM-[A-HJKMNP-Z2-9]{6}$/, "Please enter a valid reference code, like TM-ABC123"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type RecoveryInput = z.infer<typeof recoverySchema>;
export type RemoteSupportInput = z.infer<typeof remoteSupportSchema>;

/** Flatten a zod error into one human message per field. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Convert FormData to a plain object for zod (first value wins). */
export function formDataToObject(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !(key in data)) data[key] = value;
  }
  return data;
}
