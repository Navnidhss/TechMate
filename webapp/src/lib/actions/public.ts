"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/db";
import { sendCustomerAcknowledgement, sendOwnerNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import {
  bookingSchema,
  enquirySchema,
  fieldErrorsFrom,
  formDataToObject,
  quoteSchema,
  recoverySchema,
  remoteSupportSchema,
} from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  /** Whole-form error (rate limit, server problem). */
  error?: string;
  /** Per-field messages keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** Friendly confirmation message on success. */
  message?: string;
}

const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a few minutes.";
const GENERIC_ERROR = "Something went wrong at our end. Please try again, or email us directly.";

/** Best-effort client IP for rate limiting (proxy-aware, falls back to "local"). */
async function clientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export async function submitBooking(formData: FormData): Promise<ActionResult> {
  if (!rateLimit(`booking:${await clientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = bookingSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { slug: data.serviceSlug } });
  if (!service || !service.active) {
    return { ok: false, fieldErrors: { serviceSlug: "Please choose a service from the list" } };
  }

  try {
    await prisma.bookingRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        suburb: data.suburb,
        serviceSlug: data.serviceSlug,
        delivery: data.delivery,
        preferredDate: data.preferredDate ?? null,
        preferredTime: data.preferredTime,
        address: data.address ?? null,
        notes: data.notes,
      },
    });
  } catch (error) {
    console.error("[booking] failed to save:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  void sendOwnerNotification("booking", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    suburb: data.suburb,
    service: service.name,
    delivery: data.delivery,
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
    address: data.address,
    notes: data.notes,
  }).catch((error) => console.error("[booking] owner email failed:", error));

  void sendCustomerAcknowledgement("booking", data.email, data.name).catch((error) =>
    console.error("[booking] customer email failed:", error),
  );

  return {
    ok: true,
    message: `Thanks ${firstName(data.name)} — we've got your booking request and will confirm a time by email, usually the same day.`,
  };
}

export async function submitEnquiry(formData: FormData): Promise<ActionResult> {
  if (!rateLimit(`enquiry:${await clientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = enquirySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  try {
    await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject,
        message: data.message,
      },
    });
  } catch (error) {
    console.error("[enquiry] failed to save:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  void sendOwnerNotification("enquiry", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
  }).catch((error) => console.error("[enquiry] owner email failed:", error));

  void sendCustomerAcknowledgement("enquiry", data.email, data.name).catch((error) =>
    console.error("[enquiry] customer email failed:", error),
  );

  return {
    ok: true,
    message: `Thanks ${firstName(data.name)} — your message is with us and we'll reply personally, usually the same day.`,
  };
}

export async function submitQuote(formData: FormData): Promise<ActionResult> {
  if (!rateLimit(`quote:${await clientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = quoteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  try {
    await prisma.quoteRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        details: data.details,
        budget: data.budget ?? null,
      },
    });
  } catch (error) {
    console.error("[quote] failed to save:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  void sendOwnerNotification("quote", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    details: data.details,
    budget: data.budget,
  }).catch((error) => console.error("[quote] owner email failed:", error));

  void sendCustomerAcknowledgement("quote", data.email, data.name).catch((error) =>
    console.error("[quote] customer email failed:", error),
  );

  return {
    ok: true,
    message: `Thanks ${firstName(data.name)} — we've got your quote request and will come back with a fixed price, usually the same day.`,
  };
}

export async function submitRecovery(formData: FormData): Promise<ActionResult> {
  if (!rateLimit(`recovery:${await clientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = recoverySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  try {
    await prisma.dataRecoveryIntake.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        deviceType: data.deviceType,
        deviceMake: data.deviceMake ?? null,
        importance: data.importance,
        symptoms: data.symptoms,
        tampered: data.tampered,
        consent: data.consent,
      },
    });
  } catch (error) {
    console.error("[recovery] failed to save:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  void sendOwnerNotification("recovery", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    deviceType: data.deviceType,
    deviceMake: data.deviceMake,
    importance: data.importance,
    symptoms: data.symptoms,
    tampered: data.tampered,
  }).catch((error) => console.error("[recovery] owner email failed:", error));

  void sendCustomerAcknowledgement("recovery", data.email, data.name).catch((error) =>
    console.error("[recovery] customer email failed:", error),
  );

  return {
    ok: true,
    message: `Thanks ${firstName(data.name)} — we've got your data recovery request and will review it carefully. Please avoid using the device until you hear from us.`,
  };
}

export async function submitRemoteSupport(formData: FormData): Promise<ActionResult> {
  if (!rateLimit(`remote:${await clientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = remoteSupportSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  try {
    await prisma.remoteSupportRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        issue: data.issue,
        urgency: data.urgency,
      },
    });
  } catch (error) {
    console.error("[remote] failed to save:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  void sendOwnerNotification("remote-support", {
    name: data.name,
    email: data.email,
    phone: data.phone,
    issue: data.issue,
    urgency: data.urgency,
  }).catch((error) => console.error("[remote] owner email failed:", error));

  void sendCustomerAcknowledgement("remote-support", data.email, data.name).catch((error) =>
    console.error("[remote] customer email failed:", error),
  );

  return {
    ok: true,
    message: `Thanks ${firstName(data.name)} — we've got your remote support request and will be in touch, usually the same day.`,
  };
}
