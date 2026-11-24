const OAUTH_BASE = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CAL_BASE = "https://www.googleapis.com/calendar/v3/calendars";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

import { perthDate } from "@/lib/time";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID?.trim() || "primary";

export interface GoogleTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
}

export interface GoogleEvent {
  id: string;
  start: Date;
  end: Date;
}

export interface NewGoogleEvent {
  summary: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
}

function credentials(): { clientId: string; clientSecret: string } {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  };
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = credentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>): Promise<GoogleTokenResponse> {
  const response = await fetch(OAUTH_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google token request failed (${response.status})`);
  }
  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    id_token?: string;
  };
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
  };
}

export async function exchangeCode(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = credentials();
  return tokenRequest({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = credentials();
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });
}

interface RawGoogleEvent {
  id: string;
  status?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

/**
 * Busy events for the owner's calendar in [timeMin, timeMax].
 * Timed events use their exact window; all-day events block the whole Perth day.
 */
export async function listEvents(accessToken: string, timeMin: Date, timeMax: Date): Promise<GoogleEvent[]> {
  const events: GoogleEvent[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: "2500",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `${CAL_BASE}/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(`Google Calendar list failed (${response.status})`);

    const data = (await response.json()) as { items?: RawGoogleEvent[]; nextPageToken?: string };
    for (const item of data.items ?? []) {
      if (item.status === "cancelled") continue;

      if (item.start?.dateTime && item.end?.dateTime) {
        events.push({
          id: item.id,
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
        });
      } else if (item.start?.date) {
        const endDate = item.end?.date ?? item.start.date;
        events.push({
          id: item.id,
          start: perthDate(item.start.date),
          end: perthDate(endDate),
        });
      }
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return events;
}

export async function createEvent(accessToken: string, event: NewGoogleEvent): Promise<string> {
  const response = await fetch(`${CAL_BASE}/${encodeURIComponent(CALENDAR_ID)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startsAt.toISOString(), timeZone: "Australia/Perth" },
      end: { dateTime: event.endsAt.toISOString(), timeZone: "Australia/Perth" },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Calendar create failed (${response.status})`);
  const data = (await response.json()) as { id?: string };
  if (!data.id) throw new Error("Google Calendar create returned no event id");
  return data.id;
}

export async function deleteEvent(accessToken: string, eventId: string): Promise<void> {
  const response = await fetch(
    `${CAL_BASE}/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  // 404/410 mean it's already gone — that's the outcome we want.
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(`Google Calendar delete failed (${response.status})`);
  }
}

/** Redirect URI used for the OAuth dance — must match the Google Cloud console. */
export function oauthRedirectUri(origin?: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || origin || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/admin/calendar/callback`;
}
