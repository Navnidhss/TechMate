"use server";

import type { Appointment } from "@prisma/client";
import crypto from "crypto";

import { prisma } from "@/lib/db";
import {
  sendAppointmentCancelledEmail,
  sendAppointmentCustomerCancelledEmail,
  sendAppointmentCustomerEmail,
  sendAppointmentOwnerEmail,
} from "@/lib/email";
import { createEvent, deleteEvent } from "@/lib/google";
import { getValidAccessToken } from "@/lib/google-auth";
import { rateLimit } from "@/lib/rate-limit";
import { uniqueAppointmentReference } from "@/lib/reference";
import { getClientIp } from "@/lib/request";
import { computeAvailableSlots } from "@/lib/schedule";
import { getSettings } from "@/lib/settings";
import { tokensMatch } from "@/lib/tokens";
import { addDays, perthDate, perthDateString, perthFriendlyDate, perthTimeLabel } from "@/lib/time";
import { appointmentSchema, fieldErrorsFrom, formDataToObject } from "@/lib/validation";

export interface SlotsResult {
  ok: boolean;
  slots: string[];
  error?: string;
}

export interface BookingResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
  summary?: string;
  cancelUrl?: string;
  policyNote?: string;
}

export interface CancelResult {
  ok: boolean;
  error?: string;
}

const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a few minutes.";
const SLOT_TAKEN_MESSAGE = "Sorry — that time was just taken. Pick another and we'll get you sorted.";

function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Slots for a service/date. Public but deliberately terse and rate-limited. */
export async function getSlots(formData: FormData): Promise<SlotsResult> {
  if (!rateLimit(`slots:${await getClientIp()}`, 30)) {
    return { ok: false, slots: [], error: RATE_LIMIT_MESSAGE };
  }

  const serviceSlug = String(formData.get("serviceSlug") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  if (!serviceSlug || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, slots: [], error: "Please choose a service and a day." };
  }

  const settings = await getSettings();
  const today = perthDateString(new Date());
  const horizon = Number(settings.schedHorizonDays) || 30;
  const lastDay = addDays(today, horizon);
  if (date < today || date > lastDay) {
    return { ok: false, slots: [], error: "That day is outside the booking window." };
  }

  try {
    const slots = await computeAvailableSlots(serviceSlug, date);
    return { ok: true, slots };
  } catch (error) {
    console.error("[calendar] could not compute slots:", error);
    return { ok: false, slots: [], error: "We couldn't load times just now. Please try again." };
  }
}

export async function bookAppointment(formData: FormData): Promise<BookingResult> {
  if (!rateLimit(`book:${await getClientIp()}`)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const parsed = appointmentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const data = parsed.data;

  const [service, settings] = await Promise.all([
    prisma.service.findUnique({ where: { slug: data.serviceSlug } }),
    getSettings(),
  ]);
  if (!service || !service.active) {
    return { ok: false, fieldErrors: { serviceSlug: "Please choose a service from the list" } };
  }

  const serviceDelivery = service.delivery.split(",").map((value) => value.trim());
  if (!serviceDelivery.includes(data.delivery)) {
    return { ok: false, fieldErrors: { delivery: "That service isn't available with this option" } };
  }
  if (data.delivery === "onsite" && !data.address) {
    return { ok: false, fieldErrors: { address: "Please add the address for an onsite visit" } };
  }

  const today = perthDateString(new Date());
  const horizon = Number(settings.schedHorizonDays) || 30;
  if (data.date < today || data.date > addDays(today, horizon)) {
    return { ok: false, fieldErrors: { date: "Please choose a day within the booking window" } };
  }

  const available = await computeAvailableSlots(service.slug, data.date);
  if (!available.includes(data.slot)) {
    return { ok: false, error: "Sorry — that time isn't available any more. Please pick another." };
  }

  const startsAt = perthDate(data.date, data.slot);
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);
  const reference = await uniqueAppointmentReference();
  const cancelToken = crypto.randomBytes(16).toString("hex");
  const bufferMinutes = Number(settings.schedBufferMinutes) || 0;

  let appointment: Appointment;
  try {
    // Re-check local bookings inside the transaction — two people tapping the
    // same slot at once must not both get it (SQLite serialises the writes).
    appointment = await prisma.$transaction(async (tx) => {
      const bufferMs = bufferMinutes * 60 * 1000;
      const nearby = await tx.appointment.findMany({
        where: {
          status: "booked",
          startsAt: { lt: new Date(endsAt.getTime() + bufferMs) },
          endsAt: { gt: new Date(startsAt.getTime() - bufferMs) },
        },
        select: { id: true },
      });
      if (nearby.length > 0) throw new Error("SLOT_TAKEN");

      return tx.appointment.create({
        data: {
          reference,
          serviceSlug: service.slug,
          serviceName: service.name,
          delivery: data.delivery,
          durationMinutes: service.durationMinutes,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          suburb: data.suburb,
          address: data.address ?? null,
          notes: data.notes ?? "",
          startsAt,
          endsAt,
          status: "booked",
          cancelToken,
        },
      });
    });
  } catch (error) {
    console.error("[calendar] booking transaction failed:", error);
    return { ok: false, error: SLOT_TAKEN_MESSAGE };
  }

  // Best-effort Google event — bookings must never fail because Google is down.
  try {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      const firstName = appointment.customerName.split(" ")[0];
      const eventId = await createEvent(accessToken, {
        summary: `${appointment.serviceName} — ${firstName} (${appointment.suburb})`,
        description: [
          `Reference: ${appointment.reference}`,
          `Service: ${appointment.serviceName} (${appointment.durationMinutes} min)`,
          `Delivery: ${appointment.delivery}`,
          `Customer: ${appointment.customerName}`,
          `Email: ${appointment.customerEmail}`,
          `Phone: ${appointment.customerPhone}`,
          appointment.address ? `Address: ${appointment.address}` : "",
          appointment.notes ? `Notes: ${appointment.notes}` : "",
          "",
          "Added automatically by the TechMate website.",
        ]
          .filter(Boolean)
          .join("\n"),
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
      });
      await prisma.appointment.update({ where: { id: appointment.id }, data: { googleEventId: eventId } });
    }
  } catch (error) {
    console.error("[calendar] could not create Google event:", error);
  }

  void sendAppointmentOwnerEmail(appointment).catch((error) =>
    console.error("[calendar] owner email failed:", error),
  );
  void sendAppointmentCustomerEmail(appointment).catch((error) =>
    console.error("[calendar] customer email failed:", error),
  );

  return {
    ok: true,
    reference: appointment.reference,
    summary: `${perthFriendlyDate(appointment.startsAt)} at ${perthTimeLabel(appointment.startsAt)}`,
    cancelUrl: `${siteBase()}/cancel/${appointment.reference}?token=${appointment.cancelToken}`,
    policyNote: settings.schedPolicyNote,
  };
}

export async function cancelAppointment(formData: FormData): Promise<CancelResult> {
  if (!rateLimit(`cancel:${await getClientIp()}`, 10)) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  const token = String(formData.get("token") ?? "").trim();
  if (!/^TM-[A-HJKMNP-Z2-9]{6}$/.test(reference) || !token) {
    return { ok: false, error: "This link doesn't seem right. Please contact us and we'll sort it out." };
  }

  const appointment = await prisma.appointment.findUnique({ where: { reference } });
  if (!appointment || !tokensMatch(token, appointment.cancelToken)) {
    return { ok: false, error: "This link doesn't seem right. Please contact us and we'll sort it out." };
  }
  if (appointment.status !== "booked") {
    return { ok: false, error: "This booking is no longer active, so there's nothing to cancel." };
  }

  const cancelled = await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "cancelled", cancelledBy: "customer" },
  });

  if (cancelled.googleEventId) {
    try {
      const accessToken = await getValidAccessToken();
      if (accessToken) await deleteEvent(accessToken, cancelled.googleEventId);
    } catch (error) {
      console.error("[calendar] could not delete Google event:", error);
    }
  }

  void sendAppointmentCancelledEmail(cancelled, "customer").catch((error) =>
    console.error("[calendar] cancellation owner email failed:", error),
  );
  void sendAppointmentCustomerCancelledEmail(cancelled).catch((error) =>
    console.error("[calendar] cancellation customer email failed:", error),
  );

  return { ok: true };
}
