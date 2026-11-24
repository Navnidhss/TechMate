"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendJobUpdateEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { uniqueJobReference } from "@/lib/reference";
import { getClientIp } from "@/lib/request";
import { COOKIE_NAME, createSessionToken } from "@/lib/session";
import {
  BOOKING_STATUSES,
  DELIVERY_OPTIONS,
  ENQUIRY_STATUSES,
  JOB_STATUSES,
  QUOTE_STATUSES,
  RECOVERY_STATUSES,
  REMOTE_STATUSES,
} from "@/lib/statuses";
import {
  areaSchema,
  faqSchema,
  fieldErrorsFrom,
  formDataToObject,
  jobUpdateSchema,
  loginSchema,
  passwordChangeSchema,
  serviceSchema,
  settingsSchema,
} from "@/lib/validation";

export interface AdminActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a few minutes.";
const GENERIC_LOGIN_ERROR = "Incorrect username or password.";

/** Only allow post-login redirects back into the admin area. */
function safeNext(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("/admin/login")
    ? value
    : null;
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

export async function login(formData: FormData): Promise<AdminActionResult & { next?: string }> {
  const ip = await getClientIp();
  if (!rateLimit(`login:${ip}`)) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, error: GENERIC_LOGIN_ERROR };

  const user = await prisma.adminUser.findUnique({ where: { username: parsed.data.username } });
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { ok: false, error: GENERIC_LOGIN_ERROR };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60,
    path: "/",
  });

  return {
    ok: true,
    next: user.mustChangePassword ? "/admin/change-password" : (safeNext(formData.get("next")) ?? "/admin"),
  };
}

export async function changePassword(formData: FormData): Promise<AdminActionResult> {
  const uid = await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const user = await prisma.adminUser.findUnique({ where: { id: uid } });
  if (!user) redirect("/admin/login");

  const currentValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!currentValid) {
    return { ok: false, fieldErrors: { currentPassword: "That current password doesn't look right" } };
  }
  if (await bcrypt.compare(parsed.data.newPassword, user.passwordHash)) {
    return { ok: false, fieldErrors: { newPassword: "Please choose a password you haven't used before" } };
  }

  await prisma.adminUser.update({
    where: { id: uid },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10), mustChangePassword: false },
  });

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Submission statuses                                                 */
/* ------------------------------------------------------------------ */

const STATUS_SETS = {
  booking: BOOKING_STATUSES,
  enquiry: ENQUIRY_STATUSES,
  quote: QUOTE_STATUSES,
  recovery: RECOVERY_STATUSES,
  remote: REMOTE_STATUSES,
} as const;

const STATUS_ROUTES: Record<keyof typeof STATUS_SETS, string> = {
  booking: "/admin/bookings",
  enquiry: "/admin/enquiries",
  quote: "/admin/quotes",
  recovery: "/admin/recoveries",
  remote: "/admin/remote",
};

type StatusKind = keyof typeof STATUS_SETS;

function isStatusKind(value: string): value is StatusKind {
  return value in STATUS_SETS;
}

/** Instant-save status dropdown used on every submission table. */
export async function updateSubmissionStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const kind = String(formData.get("kind") ?? "");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  if (!isStatusKind(kind) || !Number.isInteger(id) || id <= 0) return;
  if (!(STATUS_SETS[kind] as readonly string[]).includes(status)) return;

  const data = { status };
  switch (kind) {
    case "booking":
      await prisma.bookingRequest.update({ where: { id }, data });
      break;
    case "enquiry":
      await prisma.enquiry.update({ where: { id }, data });
      break;
    case "quote":
      await prisma.quoteRequest.update({ where: { id }, data });
      break;
    case "recovery":
      await prisma.dataRecoveryIntake.update({ where: { id }, data });
      break;
    case "remote":
      await prisma.remoteSupportRequest.update({ where: { id }, data });
      break;
  }

  revalidatePath(STATUS_ROUTES[kind]);
  revalidatePath("/admin");
}

/* ------------------------------------------------------------------ */
/* Jobs                                                                */
/* ------------------------------------------------------------------ */

export async function createJobFromBooking(formData: FormData): Promise<void> {
  await requireAdmin();

  const bookingId = Number(formData.get("bookingId"));
  if (!Number.isInteger(bookingId) || bookingId <= 0) redirect("/admin/bookings");

  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: { job: true },
  });
  if (!booking) redirect("/admin/bookings");
  if (booking.job) redirect(`/admin/jobs/${booking.job.id}`);

  const service = await prisma.service.findUnique({ where: { slug: booking.serviceSlug } });
  const reference = await uniqueJobReference();

  const job = await prisma.job.create({
    data: {
      reference,
      customerName: booking.name,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      suburb: booking.suburb,
      serviceSummary: `${service?.name ?? booking.serviceSlug} (${booking.delivery})`,
      status: "received",
      statusNote: "We've received your booking and will confirm the details shortly.",
      adminNote: booking.notes,
      bookingId: booking.id,
    },
  });

  await prisma.bookingRequest.update({ where: { id: booking.id }, data: { status: "confirmed" } });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
  redirect(`/admin/jobs/${job.id}`);
}

/** Quick status change from the jobs list — emails the customer if the status moved. */
export async function updateJobStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const jobId = Number(formData.get("jobId"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isInteger(jobId) || jobId <= 0) redirect("/admin/jobs");
  if (!(JOB_STATUSES as readonly string[]).includes(status)) redirect("/admin/jobs");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) redirect("/admin/jobs");
  if (job.status === status) redirect("/admin/jobs");

  await prisma.job.update({ where: { id: jobId }, data: { status } });

  if (job.customerEmail) {
    void sendJobUpdateEmail(job.reference, job.customerEmail, job.customerName, job.statusNote).catch((error) =>
      console.error("[job] status email failed:", error),
    );
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin");
  redirect("/admin/jobs");
}

export async function updateJob(formData: FormData): Promise<void> {
  await requireAdmin();

  const jobId = Number(formData.get("jobId"));
  if (!Number.isInteger(jobId) || jobId <= 0) redirect("/admin/jobs");

  const parsed = jobUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the job details";
    redirect(`/admin/jobs/${jobId}?error=${encodeURIComponent(message)}`);
  }

  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existing) redirect("/admin/jobs");

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: parsed.data.status,
      statusNote: parsed.data.statusNote,
      adminNote: parsed.data.adminNote,
    },
  });

  const changed = existing.status !== parsed.data.status || existing.statusNote !== parsed.data.statusNote;
  if (changed && existing.customerEmail) {
    void sendJobUpdateEmail(
      existing.reference,
      existing.customerEmail,
      existing.customerName,
      parsed.data.statusNote,
    ).catch((error) => console.error("[job] update email failed:", error));
  }

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin");
  redirect(`/admin/jobs/${jobId}?saved=1`);
}

/* ------------------------------------------------------------------ */
/* Content — services                                                  */
/* ------------------------------------------------------------------ */

function revalidateServicePages(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/pricing");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/services/${slug}`);
}

export async function saveService(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const parsed = serviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the service details";
    redirect(`/admin/content/services?error=${encodeURIComponent(message)}`);
  }

  const delivery = formData
    .getAll("delivery")
    .map(String)
    .filter((value): value is (typeof DELIVERY_OPTIONS)[number] =>
      (DELIVERY_OPTIONS as readonly string[]).includes(value),
    );

  if (delivery.length === 0) {
    redirect(`/admin/content/services?error=${encodeURIComponent("Please choose at least one way to deliver this service")}`);
  }

  const data = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    shortDesc: parsed.data.shortDesc,
    description: parsed.data.description,
    delivery: delivery.join(","),
    priceFrom: parsed.data.priceFrom || null,
    priceNotes: parsed.data.priceNotes || null,
    icon: parsed.data.icon || null,
    durationMinutes: parsed.data.durationMinutes,
    sortOrder: parsed.data.sortOrder,
  };

  try {
    if (Number.isInteger(id) && id > 0) {
      await prisma.service.update({ where: { id }, data });
    } else {
      await prisma.service.create({ data });
    }
  } catch (error) {
    console.error("[content] failed to save service:", error);
    redirect(`/admin/content/services?error=${encodeURIComponent("That web address name is already used by another service")}`);
  }

  revalidateServicePages(data.slug);
  redirect(`/admin/content/services?saved=${encodeURIComponent(data.slug)}`);
}

export async function toggleServiceActive(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/admin/content/services");

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) redirect("/admin/content/services");

  await prisma.service.update({ where: { id }, data: { active: !service.active } });
  revalidateServicePages(service.slug);
  revalidatePath("/admin/content/services");
}

export async function deleteService(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/admin/content/services");

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) redirect("/admin/content/services");

  const bookingCount = await prisma.bookingRequest.count({ where: { serviceSlug: service.slug } });
  if (bookingCount > 0) {
    redirect(
      `/admin/content/services?error=${encodeURIComponent(
        `"${service.name}" has ${bookingCount} booking(s) linked to it, so it can't be deleted. Deactivate it instead.`,
      )}`,
    );
  }

  await prisma.service.delete({ where: { id } });
  revalidateServicePages(service.slug);
  redirect(`/admin/content/services?saved=deleted`);
}

/* ------------------------------------------------------------------ */
/* Content — FAQs                                                      */
/* ------------------------------------------------------------------ */

export async function saveFaq(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const parsed = faqSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the FAQ details";
    redirect(`/admin/content/faq?error=${encodeURIComponent(message)}`);
  }

  if (Number.isInteger(id) && id > 0) {
    await prisma.faq.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.faq.create({ data: parsed.data });
  }

  revalidatePath("/");
  revalidatePath("/faq");
  redirect(`/admin/content/faq?saved=1`);
}

export async function deleteFaq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await prisma.faq.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/faq");
  redirect(`/admin/content/faq?saved=1`);
}

/* ------------------------------------------------------------------ */
/* Content — service areas                                             */
/* ------------------------------------------------------------------ */

export async function saveArea(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = areaSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the area details";
    redirect(`/admin/content/areas?error=${encodeURIComponent(message)}`);
  }

  const maxOrder = await prisma.serviceArea.aggregate({ _max: { sortOrder: true } });
  try {
    await prisma.serviceArea.create({
      data: { ...parsed.data, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
    });
  } catch (error) {
    console.error("[content] failed to add area:", error);
    redirect(`/admin/content/areas?error=${encodeURIComponent("That suburb is already in this zone")}`);
  }

  revalidatePath("/service-areas");
  revalidatePath("/book");
  redirect(`/admin/content/areas?saved=1`);
}

export async function deleteArea(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await prisma.serviceArea.delete({ where: { id } });
  revalidatePath("/service-areas");
  revalidatePath("/book");
  redirect(`/admin/content/areas?saved=1`);
}

/* ------------------------------------------------------------------ */
/* Content — settings                                                  */
/* ------------------------------------------------------------------ */

export async function saveSettings(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the settings";
    redirect(`/admin/content/settings?error=${encodeURIComponent(message)}`);
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    const stored = String(value);
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: stored },
      create: { key, value: stored },
    });
  }

  // Settings feed the header, footer and every page — refresh the lot.
  revalidatePath("/", "layout");
  redirect(`/admin/content/settings?saved=1`);
}
