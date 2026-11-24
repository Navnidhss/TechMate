import { z } from "zod";

import {
  BUDGET_OPTIONS,
  DELIVERY_OPTIONS,
  DEVICE_TYPES,
  IMPORTANCE_OPTIONS,
  JOB_STATUSES,
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

/* ------------------------------------------------------------------
   Admin schemas (server actions in lib/actions/admin.ts)
   ------------------------------------------------------------------ */

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Please enter your username"),
  password: z.string().min(1, "Please enter your password"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    newPassword: z
      .string()
      .min(10, "Your new password needs to be at least 10 characters")
      .max(200, "That password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Those passwords don't match",
    path: ["confirmPassword"],
  });

export const jobUpdateSchema = z.object({
  status: z.enum(JOB_STATUSES, { message: "Please choose a valid status" }),
  statusNote: z
    .string()
    .trim()
    .min(5, "Please write a short update the customer will see")
    .max(1000, "That note is a little too long"),
  adminNote: z.string().trim().max(2000, "That note is a little too long"),
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Please add a short web address name")
    .max(60, "That's a little long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().trim().min(2, "Please add the service name").max(80, "That name is a little too long"),
  shortDesc: z
    .string()
    .trim()
    .min(10, "Please add a short summary for the service cards")
    .max(160, "Please keep the summary under 160 characters"),
  description: z
    .string()
    .trim()
    .min(50, "Please write a little more detail for the service page")
    .max(8000, "That description is a little too long"),
  priceFrom: z.string().trim().max(40, "That price is a little too long"),
  priceNotes: z.string().trim().max(300, "That note is a little too long"),
  icon: z.string().trim().max(40),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number of minutes")
    .min(15, "Duration must be at least 15 minutes")
    .max(240, "Duration must be 4 hours or less")
    .refine((value) => value % 15 === 0, "Use 15-minute steps (15, 30, 45…)"),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const faqSchema = z.object({
  question: z.string().trim().min(5, "Please add the question").max(200, "That question is a little too long"),
  answer: z.string().trim().min(10, "Please add an answer").max(5000, "That answer is a little too long"),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const areaSchema = z.object({
  zone: z.string().trim().min(2, "Please add the zone name").max(60, "That zone name is a little too long"),
  suburb: z.string().trim().min(2, "Please add the suburb").max(60, "That suburb name is a little too long"),
});

export const settingsSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .min(1, "Please add the contact email")
    .max(120, "That email is a little too long")
    .email("Please check the contact email address"),
  contactPhone: z.string().trim().min(5, "Please add the contact phone number").max(30, "That phone number is a little long"),
  businessName: z.string().trim().min(2, "Please add the business name").max(80, "That name is a little too long"),
  tagline: z.string().trim().min(5, "Please add a short tagline").max(160, "That tagline is a little too long"),
  tradingHours: z.string().trim().min(2, "Please add your trading hours").max(200, "That's a little too long"),
  anydeskInfo: z.string().trim().min(5, "Please add the AnyDesk instructions").max(400, "That's a little too long"),
  workshopAddress: z.string().trim().min(2, "Please add your workshop / drop-off details").max(300, "That's a little too long"),
  abn: z.string().trim().max(30, "That ABN looks a little long"),

  schedDays: z
    .string()
    .trim()
    .regex(/^[1-7](,[1-7])*$/, "Use numbers 1–7 separated by commas (1 = Monday)"),
  schedStart: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 08:00"),
  schedEnd: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 18:00"),
  schedHorizonDays: z.coerce.number().int().min(1, "At least 1 day").max(365, "365 days is the maximum"),
  schedNoticeHours: z.coerce.number().int().min(0, "Cannot be negative").max(72, "72 hours is the maximum"),
  schedBufferMinutes: z.coerce.number().int().min(0, "Cannot be negative").max(120, "120 minutes is the maximum"),
  schedPolicyNote: z
    .string()
    .trim()
    .min(5, "Please add a short cancellation note")
    .max(500, "That note is a little too long"),
});

/** New appointment (live scheduler booking). */
export const appointmentSchema = z.object({
  name,
  email,
  phone,
  suburb,
  serviceSlug: z.string().trim().min(1, "Please choose a service"),
  delivery: z.enum(DELIVERY_OPTIONS, { message: "Please choose how you'd like us to help" }),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a day"),
  slot: z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please choose a time"),
  address: optional(z.string().trim().max(200, "That address is a little too long")),
  notes: optional(z.string().trim().max(5000, "That's a little long for us to read — please shorten it")),
});

/** Admin availability block. */
export const scheduleBlockSchema = z
  .object({
    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date"),
    allDay: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
    startTime: optional(z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:00")),
    endTime: optional(z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 12:00")),
    reason: z.string().trim().max(120, "That reason is a little too long"),
  })
  .refine(
    (data) => data.allDay || (Boolean(data.startTime) && Boolean(data.endTime)),
    { message: "Add a start and end time, or choose all day", path: ["startTime"] },
  )
  .refine((data) => data.allDay || (data.startTime ?? "") < (data.endTime ?? ""), {
    message: "The end time needs to be after the start time",
    path: ["endTime"],
  });
