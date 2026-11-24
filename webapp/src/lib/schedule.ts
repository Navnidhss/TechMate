import { prisma } from "@/lib/db";
import { sendSyncRemovedEmail } from "@/lib/email";
import { listEvents } from "@/lib/google";
import { getConnection, getValidAccessToken } from "@/lib/google-auth";
import { getSettings } from "@/lib/settings";
import { perthDate, perthWeekday } from "@/lib/time";

const CACHE_TTL_MS = 5 * 60 * 1000;
const SLOT_STEP_MS = 30 * 60 * 1000;
const MAX_SLOTS = 40;

export interface BusyData {
  intervals: [Date, Date][];
  eventIds: string[];
}

function parseCache(cache: { busyJson: string; eventIdsJson: string }): BusyData {
  const raw = JSON.parse(cache.busyJson) as [string, string][];
  const eventIds = JSON.parse(cache.eventIdsJson) as string[];
  return {
    intervals: raw.map(([start, end]) => [new Date(start), new Date(end)]),
    eventIds,
  };
}

/** Email the owner and free bookings whose Google events have disappeared. */
async function reconcileRemovedEvents(eventIds: string[], timeMax: Date): Promise<void> {
  const present = new Set(eventIds);
  const appointments = await prisma.appointment.findMany({
    where: {
      status: "booked",
      googleEventId: { not: null },
      startsAt: { gte: new Date(), lte: timeMax },
    },
  });

  for (const appointment of appointments) {
    if (!appointment.googleEventId || present.has(appointment.googleEventId)) continue;
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "cancelled-synced" },
    });
    void sendSyncRemovedEmail(updated).catch((error) =>
      console.error("[schedule] sync-removed email failed:", error),
    );
  }
}

/**
 * Busy intervals (UTC) for the booking horizon, merged from Google Calendar
 * (cached for 5 minutes) and returned for merging with local data.
 */
export async function getBusy(force = false): Promise<BusyData> {
  const cache = await prisma.calendarCache.findUnique({ where: { id: "singleton" } });
  if (!force && cache && Date.now() - cache.fetchedAt.getTime() < CACHE_TTL_MS) {
    return parseCache(cache);
  }

  const settings = await getSettings();
  const horizonDays = Number(settings.schedHorizonDays) || 30;
  const now = new Date();
  const timeMax = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  let intervals: [Date, Date][] = [];
  let eventIds: string[] = [];

  const connection = await getConnection();
  if (connection) {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      try {
        const events = await listEvents(accessToken, now, timeMax);
        eventIds = events.map((event) => event.id);
        intervals = events.map((event) => [event.start, event.end] as [Date, Date]);
        await reconcileRemovedEvents(eventIds, timeMax);
        await prisma.calendarConnection.update({
          where: { id: 1 },
          data: { lastSyncedAt: new Date() },
        });
      } catch (error) {
        console.error("[schedule] Google Calendar sync failed — using local availability only:", error);
        // Serve the last known cache rather than blocking bookings.
        if (cache) return parseCache(cache);
      }
    }
  }

  const busyJson = JSON.stringify(intervals.map(([start, end]) => [start.toISOString(), end.toISOString()]));
  const eventIdsJson = JSON.stringify(eventIds);
  await prisma.calendarCache.upsert({
    where: { id: "singleton" },
    update: { busyJson, eventIdsJson, fetchedAt: new Date() },
    create: { id: "singleton", busyJson, eventIdsJson, fetchedAt: new Date() },
  });

  return { intervals, eventIds };
}

function perthHhmm(date: Date): string {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(11, 16);
}

function conflicts(start: Date, end: Date, intervals: [Date, Date][], bufferMs: number): boolean {
  return intervals.some(
    ([busyStart, busyEnd]) =>
      start.getTime() < busyEnd.getTime() + bufferMs && end.getTime() + bufferMs > busyStart.getTime(),
  );
}

/** Bookable "HH:MM" slots for a service on a Perth date. Empty = fully booked/closed. */
export async function computeAvailableSlots(serviceSlug: string, dateStr: string): Promise<string[]> {
  const [service, settings] = await Promise.all([
    prisma.service.findUnique({ where: { slug: serviceSlug } }),
    getSettings(),
  ]);
  if (!service || !service.active) return [];

  const workDays = settings.schedDays.split(",").map((day) => Number(day.trim()));
  if (!workDays.includes(perthWeekday(dateStr))) return [];

  const blocks = await prisma.scheduleBlock.findMany({ where: { date: dateStr } });
  if (blocks.some((block) => block.allDay)) return [];

  const dayStart = perthDate(dateStr, settings.schedStart);
  const dayEnd = perthDate(dateStr, settings.schedEnd);
  const now = Date.now();
  const noticeMs = (Number(settings.schedNoticeHours) || 0) * 60 * 60 * 1000;
  const bufferMs = (Number(settings.schedBufferMinutes) || 0) * 60 * 1000;
  const horizonDays = Number(settings.schedHorizonDays) || 30;
  const horizonEnd = new Date(now + horizonDays * 24 * 60 * 60 * 1000);

  const [busy, localAppointments] = await Promise.all([
    getBusy(),
    prisma.appointment.findMany({
      where: {
        status: "booked",
        startsAt: { lt: horizonEnd },
        endsAt: { gt: new Date(now) },
      },
    }),
  ]);

  const intervals: [Date, Date][] = [
    ...busy.intervals,
    ...localAppointments.map((appointment) => [appointment.startsAt, appointment.endsAt] as [Date, Date]),
  ];

  for (const block of blocks) {
    if (!block.allDay && block.startTime && block.endTime) {
      intervals.push([perthDate(dateStr, block.startTime), perthDate(dateStr, block.endTime)]);
    }
  }

  const durationMs = service.durationMinutes * 60 * 1000;
  const earliest = now + noticeMs;
  const slots: string[] = [];

  for (let t = dayStart.getTime(); t + durationMs <= dayEnd.getTime(); t += SLOT_STEP_MS) {
    if (t < earliest) continue;
    const start = new Date(t);
    const end = new Date(t + durationMs);
    if (conflicts(start, end, intervals, bufferMs)) continue;

    slots.push(perthHhmm(start));
    if (slots.length >= MAX_SLOTS) break;
  }

  return slots;
}

