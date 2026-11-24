"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendAppointmentCancelledEmail } from "@/lib/email";
import { deleteEvent } from "@/lib/google";
import { getValidAccessToken } from "@/lib/google-auth";
import { getBusy } from "@/lib/schedule";
import { fieldErrorsFrom, formDataToObject, scheduleBlockSchema } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

export async function cancelAppointmentAdmin(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) redirect("/admin/appointments");

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) redirect("/admin/appointments?error=Booking%20not%20found");
  if (appointment.status !== "booked") {
    redirect(`/admin/appointments?error=${encodeURIComponent("That booking is no longer active")}`);
  }

  const cancelled = await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled", cancelledBy: "owner" },
  });

  if (cancelled.googleEventId) {
    try {
      const accessToken = await getValidAccessToken();
      if (accessToken) await deleteEvent(accessToken, cancelled.googleEventId);
    } catch (error) {
      console.error("[admin] could not delete Google event:", error);
    }
  }

  void sendAppointmentCancelledEmail(cancelled, "owner").catch((error) =>
    console.error("[admin] cancellation email failed:", error),
  );

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  revalidatePath("/book");
  redirect("/admin/appointments?saved=cancelled");
}

/* ------------------------------------------------------------------ */
/* Availability blocks                                                 */
/* ------------------------------------------------------------------ */

export async function addScheduleBlock(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = scheduleBlockSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const message = Object.values(fieldErrorsFrom(parsed.error))[0] ?? "Please check the block details";
    redirect(`/admin/calendar?error=${encodeURIComponent(message)}`);
  }

  await prisma.scheduleBlock.create({
    data: {
      date: parsed.data.date,
      allDay: parsed.data.allDay,
      startTime: parsed.data.allDay ? null : (parsed.data.startTime ?? null),
      endTime: parsed.data.allDay ? null : (parsed.data.endTime ?? null),
      reason: parsed.data.reason,
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/book");
  redirect("/admin/calendar?saved=block");
}

export async function deleteScheduleBlock(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    await prisma.scheduleBlock.delete({ where: { id } });
  }

  revalidatePath("/admin/calendar");
  revalidatePath("/book");
  redirect("/admin/calendar?deleted=1");
}

/* ------------------------------------------------------------------ */
/* Google Calendar connection                                          */
/* ------------------------------------------------------------------ */

export async function disconnectGoogle(): Promise<void> {
  await requireAdmin();

  await prisma.calendarConnection.deleteMany();
  await prisma.calendarCache.deleteMany();

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  redirect("/admin/calendar?disconnected=1");
}

export async function forceSync(): Promise<void> {
  await requireAdmin();

  try {
    await getBusy(true);
  } catch (error) {
    console.error("[admin] forced sync failed:", error);
    redirect("/admin/calendar?error=" + encodeURIComponent("Sync failed — check the server log for details."));
  }

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/appointments");
  redirect("/admin/calendar?synced=1");
}
