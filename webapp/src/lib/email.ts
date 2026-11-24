import nodemailer, { type Transporter } from "nodemailer";

import { getSettings } from "@/lib/settings";

/**
 * Email delivery over Gmail SMTP.
 * Rules of engagement:
 * - If SMTP isn't configured, skip sending and log — never break a form submission.
 * - Recipient comes from the editable `contactEmail` setting (env fallback).
 * - All sends are plain text: reliable, readable and no HTML escaping worries.
 */

export type NotificationKind = "booking" | "enquiry" | "quote" | "recovery" | "remote-support";

const KIND_LABELS: Record<NotificationKind, string> = {
  booking: "booking request",
  enquiry: "enquiry",
  quote: "quote request",
  recovery: "data recovery request",
  "remote-support": "remote support request",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  suburb: "Suburb",
  service: "Service",
  delivery: "Delivery",
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  address: "Address",
  notes: "Notes",
  subject: "Subject",
  message: "Message",
  details: "Details",
  budget: "Budget",
  deviceType: "Device type",
  deviceMake: "Make / model",
  importance: "Importance",
  symptoms: "Symptoms",
  tampered: "Previously opened?",
  urgency: "Urgency",
};

const PLACEHOLDER_PASSWORD = "your_gmail_app_password_here";

function isEmailConfigured(): boolean {
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && pass && pass !== PLACEHOLDER_PASSWORD);
}

function getTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      // Gmail shows app passwords with spaces; strip them so both forms work.
      pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
    },
  });
}

async function ownerRecipient(): Promise<string> {
  const settings = await getSettings();
  return settings.contactEmail || process.env.OWNER_EMAIL_FALLBACK || process.env.SMTP_USER || "";
}

function formatBody(data: Record<string, string | boolean | undefined>): string {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] ?? key;
      const text = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
      return `${label}: ${text}`;
    })
    .join("\n");
}

/** Email the owner about a new submission. Callers fire-and-forget. */
export async function sendOwnerNotification(
  kind: NotificationKind,
  data: Record<string, string | boolean | undefined>,
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[email] not configured — skipped owner notification for ${kind}`);
    return;
  }

  const to = await ownerRecipient();
  if (!to) {
    console.warn(`[email] no owner address — skipped ${kind} notification`);
    return;
  }

  const name = typeof data.name === "string" ? data.name : "someone";
  const replyTo = typeof data.email === "string" ? data.email : undefined;
  const subject = `[TechMate] New ${KIND_LABELS[kind]}: ${name}`;
  const body = [
    `New ${KIND_LABELS[kind]} from the TechMate website.`,
    "",
    formatBody(data),
    "",
    "Reply directly to this email to contact the customer.",
  ].join("\n");

  try {
    await getTransporter().sendMail({
      from: `"TechMate Website" <${process.env.SMTP_USER}>`,
      to,
      replyTo,
      subject,
      text: body,
    });
    console.info(`[email] sent "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[email] failed to send ${kind} notification:`, error);
  }
}

const ACK_BODIES: Record<NotificationKind, string> = {
  booking:
    "We've got your booking request and we'll confirm a time by email or phone — usually the same day.\n\nIf anything is urgent, just reply to this email and let us know.",
  enquiry:
    "We've got your message and we'll reply personally — usually the same day.\n\nIf you'd rather talk it through, just reply with a good time to call.",
  quote:
    "We've got your quote request and we'll come back to you with a fixed price — usually the same day.\n\nWe may ask a couple of quick questions if that helps us quote accurately.",
  recovery:
    "We've got your data recovery request. Please avoid using the device if you can — every restart can reduce the chance of recovery.\n\nWe'll review the details and get back to you — usually the same day.",
  "remote-support":
    "We've got your remote support request and we'll be in touch — usually the same day.\n\nWhen we're ready to connect, we'll ask for your 9-digit AnyDesk ID.",
};

/** Friendly "we got it" email to the customer. Callers fire-and-forget. */
export async function sendCustomerAcknowledgement(
  kind: NotificationKind,
  to: string,
  name: string,
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[email] not configured — skipped customer acknowledgement for ${kind}`);
    return;
  }
  if (!to) return;

  const settings = await getSettings();
  const firstName = name.split(" ")[0] || name;
  const subject = `We've got your ${KIND_LABELS[kind]} — ${settings.businessName}`;
  const body = [
    `Hi ${firstName},`,
    "",
    `Thanks for getting in touch with ${settings.businessName}. This is just a quick note to say your ${KIND_LABELS[kind]} has arrived safely.`,
    "",
    ACK_BODIES[kind],
    "",
    `You can reach us any time at ${settings.contactEmail} or ${settings.contactPhone}.`,
    "",
    `— ${settings.businessName}`,
    settings.tagline,
  ].join("\n");

  try {
    await getTransporter().sendMail({
      from: `"${settings.businessName}" <${process.env.SMTP_USER}>`,
      to,
      replyTo: settings.contactEmail,
      subject,
      text: body,
    });
    console.info(`[email] sent acknowledgement "${subject}" to ${to}`);
  } catch (error) {
    console.error(`[email] failed to send ${kind} acknowledgement:`, error);
  }
}
