# IMPLEMENTATION_PLAN_4.5.md — Phase 4.5: Live Calendar Scheduling + Google Calendar (Two-Way)

> **AUTHORITATIVE CODE-LEVEL SPEC for Phase 4.5.** Follow exactly; where this conflicts with your preferences, this document wins. Read `HANDOFF.md` first for project status, and `IMPLEMENTATION_PLAN.md` (the Phase 1–4 spec) for the established conventions — coding standards (PART 12 there), status-constant pattern, form/action architecture, email pattern and documentation rules all carry over unchanged.

---

## PART 0 — MISSION, DECISIONS & GROUND RULES

### 0.1 Owner decisions for Phase 4.5 (confirmed — do not re-ask)

1. **Google integration: TWO-WAY.** Customer bookings auto-create events in the owner's Google Calendar; the owner's existing Google events block out slots on the site.
2. **Instant booking.** A slot is booked the moment the customer confirms. No owner confirmation step, no holds.
3. **Availability defaults confirmed:** Mon–Sat 8am–6pm (matches trading hours), bookable up to 30 days ahead, minimum 2 hours' notice, 30-minute buffer between jobs. All editable in admin.
4. **Per-service slot durations**, editable in the admin services content editor.
5. **Cancellations: both.** Customers cancel via a tokenised link (sent in their confirmation email); the owner cancels via admin, or by deleting the event directly in Google Calendar (a sync detects it and frees the slot).
6. **Keep both booking flows "for now":** `/book` becomes the live scheduler; the existing request-style form moves to `/book/request` and stays fully working. Cross-links between them.
7. **Google account:** `nsabharwal97@gmail.com`, primary calendar, for now.
8. **No-show protection: default** — a plain-language cancellation-policy note on the booking flow only.

### 0.2 Non-negotiables (unchanged from Phase 1–4)

Maintainability · content editability (all scheduling config editable in admin, nothing hard-coded) · security · documentation. Concretely for this phase: **zero new npm dependencies** (all Google calls are plain `fetch`), every new public action rate-limited + zod-validated, OAuth tokens encrypted at rest, exact code below for all security-relevant logic.

### 0.3 Rules of engagement

- Work step-by-step per PART 8; verify each step before continuing; small commits (`phase4.5: <what>`).
- **Windows quirk:** a running `next dev` server locks Prisma's query-engine DLL. Before any `prisma migrate dev` / `npm run build`, confirm no `next dev` is running (check with `Get-CimInstance Win32_Process -Filter "Name='node.exe'"`; stop the dev server first).
- If genuinely blocked: stop that step, add the question to HANDOFF.md §4 open questions, continue other steps.
- After the phase: run PART 9 verification, write `docs/PHASE_4_5.md` + `docs/CALENDAR_SETUP.md` (owner guide, PART 7), update HANDOFF.md, **STOP and report**. Phase 5 (deployment) remains off-limits.
- Update `.env.example` with the new vars (PART 3). Never commit real secrets.

---

## PART 1 — BEHAVIOUR OVERVIEW

### 1.1 Public scheduling flow (`/book`)

Five friendly steps, one client component, no page reloads:

1. **What do you need help with?** — service cards (from DB), each showing its duration ("About 90 minutes"). `?service=slug` pre-selects.
2. **How would you like us to help?** — Onsite / Remote / Workshop pills (same options as the request form).
3. **Pick a day** — horizontal scroll of date chips (next 30 days, weekday + date, phone-friendly).
4. **Pick a time** — slot chips for the chosen day (e.g. "8:00 am", "9:30 am") fetched from a server action. If none: "We're fully booked this day — try another."
5. **Your details** — name, email, phone, suburb (datalist), address (onsite only), notes → **Book**.

Confirmation panel: reference code, date/time summary, cancellation link, policy note. Both owner and customer get emails (existing `email.ts` patterns).

Fallback when Google is not connected: the scheduler works on **local availability only** (appointments + day blocks) — the site must never break because Google isn't configured. A subtle admin-only-visible banner shows "Google Calendar not connected — bookings won't appear in your calendar" in the admin.

### 1.2 Two-way Google sync

- **Book → Google:** on booking, create an event in the owner's primary calendar (service, customer first name + suburb as title; full contact details + reference in the description). Never add the customer as an attendee (personal accounts can't email attendees without verification); the customer is emailed by our own Nodemailer flow instead.
- **Google → slots:** events in the owner's calendar mark busy time. Busy intervals are fetched for the whole 30-day horizon, cached in the DB (5-minute TTL), and merged with local appointments and day blocks when computing slots.
- **Owner deletes the event in Google → slot freed:** the cache refresh runs a reconciliation — booked appointments whose `googleEventId` is no longer present in the owner's calendar are marked `cancelled-synced`, the owner is emailed a notice, and the slot frees.
- **Known v1 limitation (document, don't solve):** if the owner *moves* an event's time in Google, the site's appointment record keeps the original time. Guidance (in admin + docs): cancel it in admin and rebook.

### 1.3 Cancellations

- **Customer:** confirmation email contains `http://SITE/cancel/TM-XXXXXX?token=...`. The page shows what will be cancelled and a confirm button (POST action). Cancelling marks the appointment cancelled (`cancelledBy: customer`), frees the slot, deletes the Google event (best-effort), emails both parties.
- **Owner:** admin appointments table → Cancel (same effects, `cancelledBy: owner`), or delete the Google event and let reconciliation handle it.

### 1.4 The old request form survives

Move the existing `BookingForm` + its page to `/book/request` (unchanged behaviour, still writes `BookingRequest` + owner email). Add cross-links: scheduler page "Rather just tell us what's going wrong? Send a request →"; request page "Want to lock in a time straight away? Pick a slot →". Header "Book now", service-page and pricing-page links continue to `/book` (they keep working — the scheduler pre-selects the service from `?service=`).

---

## PART 2 — DATABASE CHANGES

### 2.1 `prisma/schema.prisma` — add to Service, plus four new models

```prisma
model Service {
  // ...existing fields unchanged...
  durationMinutes Int @default(60) // NEW — slot length for the scheduler
}

model Appointment {
  id              Int      @id @default(autoincrement())
  reference       String   @unique          // TM-XXXXXX (same generator lib as jobs)
  serviceSlug     String
  serviceName     String                    // snapshot at booking time
  delivery        String                    // onsite | remote | workshop
  durationMinutes Int                       // snapshot at booking time
  customerName    String
  customerEmail   String
  customerPhone   String
  suburb          String
  address         String?
  notes           String
  startsAt        DateTime
  endsAt          DateTime
  status          String   @default("booked") // booked | cancelled | completed | no-show | cancelled-synced
  cancelledBy     String?                   // customer | owner | null
  googleEventId   String?  @unique
  cancelToken     String   @unique           // 32 hex chars, in the customer cancel link
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ScheduleBlock {
  id        Int      @id @default(autoincrement())
  date      String                  // YYYY-MM-DD, Perth
  allDay    Boolean  @default(true)
  startTime String?                 // "HH:MM", when allDay = false
  endTime   String?                  // "HH:MM", when allDay = false
  reason    String   @default("")   // e.g. "Public holiday", "Family day"
  createdAt DateTime @default(now())
}

model CalendarConnection {          // singleton row (id = 1)
  id                Int      @id @default(1)
  googleEmail       String
  accessTokenEnc    String   // AES-256-GCM encrypted, see §4.1
  refreshTokenEnc   String   // AES-256-GCM encrypted
  accessTokenExpiry DateTime  // expiry of the current access token
  connectedAt       DateTime @default(now())
  lastSyncedAt      DateTime?
}

model CalendarCache {               // singleton row
  id           String   @id @default("singleton")
  busyJson     String   // "[[isoStart,isoEnd],...]" merged busy intervals
  eventIdsJson String   // '["googleEventId",...]' for reconciliation
  fetchedAt    DateTime
}
```

### 2.2 Migration + data

1. `npx prisma migrate dev --name phase45_scheduling` (dev server stopped first!).
2. In the generated `migration.sql`, append per-service duration updates so existing rows get sensible values (keep this SQL in the migration file):

```sql
UPDATE "Service" SET "durationMinutes" = 90 WHERE "slug" IN ('computer-repair', 'new-setup', 'networking');
UPDATE "Service" SET "durationMinutes" = 30 WHERE "slug" IN ('data-recovery', 'sourcing');
-- virus-removal, it-support, managed-it, smart-devices stay at the column default 60.
```

### 2.3 Site settings — new keys (SiteSetting rows, editable in admin)

Add to `DEFAULTS` in `src/lib/settings.ts` and to the admin settings form (with friendly labels):

| Key | Default | Admin label |
|---|---|---|
| `schedDays` | `"1,2,3,4,5,6"` | "Days you work (1=Monday … 7=Sunday)" |
| `schedStart` | `"08:00"` | "Earliest booking time" |
| `schedEnd` | `"18:00"` | "Latest booking time" |
| `schedHorizonDays` | `"30"` | "How far ahead customers can book (days)" |
| `schedNoticeHours` | `"2"` | "Minimum notice before a booking (hours)" |
| `schedBufferMinutes` | `"30"` | "Break between bookings (minutes)" |
| `schedPolicyNote` | `"Life happens — cancel any time with the link in your confirmation email. Please give us a heads-up if you can."` | "Cancellation policy shown at booking" |

Extend `settingsSchema` in `validation.ts` accordingly (HH:MM regex for times, CSV of digits 1–7 for days, integer ranges for the numbers).

---

## PART 3 — ENVIRONMENT

`.env.example` additions (and mirror into local `.env` with empty/placeholder values):

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALENDAR_ID="primary"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- `GOOGLE_CLIENT_ID/SECRET` come from the owner's one-time Google Cloud setup (PART 7). Empty values = "not configured" → scheduler runs local-only; the OAuth connect page shows setup instructions instead of a Connect button.
- `NEXT_PUBLIC_SITE_URL` also fixes Phase-1 finding F1 (used by sitemap, job-update emails, and now the appointment cancel link).

---

## PART 4 — NEW LIBRARY CODE (exact)

### 4.1 Token encryption — `src/lib/crypto.ts` (use EXACT code)

```ts
import crypto from "crypto";

const ALGO = "aes-256-gcm";

/** Deterministic key from SESSION_SECRET (never stored alongside the DB). */
function key(): Buffer {
  return crypto.scryptSync(process.env.SESSION_SECRET ?? "", "techmate-calendar", 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${enc.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decryptSecret(packed: string): string {
  const [ivB64, dataB64, tagB64] = packed.split(".");
  const decipher = crypto.createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
```

### 4.2 Perth time helper — `src/lib/time.ts` (use EXACT code)

```ts
/**
 * Western Australia has no daylight saving, so Perth is always UTC+8.
 * Build a UTC Date from a Perth calendar date (+ optional HH:MM).
 */
export function perthDate(dateStr: string, hhmm = "00:00"): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - 8, mm));
}

export function perthDateString(date: Date): string {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function perthTimeLabel(date: Date): string {
  const perth = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const h = perth.getUTCHours();
  const mm = String(perth.getUTCMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}
```

### 4.3 Google REST client — `src/lib/google.ts`

No dependencies; plain `fetch`. Endpoints (all need `Authorization: Bearer <accessToken>`):

```ts
const OAUTH_BASE = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CAL_BASE = "https://www.googleapis.com/calendar/v3/calendars";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";
```

Functions to implement (all with try/catch at call sites, never throwing into user flows):

- `buildAuthUrl(redirectUri: string, state: string): string` — auth URL with `client_id`, `redirect_uri`, `response_type=code`, `scope=SCOPE`, `access_type=offline`, `prompt=consent` (forces a refresh token), `state`.
- `exchangeCode(code: string, redirectUri: string)` / `refreshAccessToken(refreshToken: string)` — POST `OAUTH_BASE` with `application/x-www-form-urlencoded` body; return `{ accessToken, expiresIn, refreshToken? }`.
- `listEvents(accessToken: string, timeMin: Date, timeMax: Date)` — GET `${CAL_BASE}/primary/events?singleEvents=true&orderBy=startTime&showDeleted=false&timeMin=…&timeMax=…` (RFC 3339 = `toISOString()`); **follow `nextPageToken`** in a loop; return `{ id, start, end }[]` using each event's `start.dateTime`/`end.dateTime` (skip all-day events' `date` fields — treat all-day events as busy 00:00–23:59 Perth of that date instead).
- `createEvent(accessToken, { summary, description, startsAt, endsAt })` — POST `${CAL_BASE}/primary/events`, body `{ summary, description, start: { dateTime: startsAt.toISOString(), timeZone: "Australia/Perth" }, end: { … } }`; return the event `id`.
- `deleteEvent(accessToken, eventId)` — DELETE `${CAL_BASE}/primary/events/${eventId}`; 204 = success; 404/410 = treat as already gone (fine).

`src/lib/google-auth.ts` — DB-aware helpers built on the above:

- `getConnection()` → the `CalendarConnection` row or `null`.
- `getValidAccessToken()` → decrypt + refresh if `accessTokenExpiry` is within 60s; persist the new token/expiry; return `null` when not connected or configured.
- `isGoogleConfigured()` → both env vars non-empty.

### 4.4 Busy cache + reconciliation — `src/lib/schedule.ts`

```ts
/** Busy intervals (UTC) for the horizon, merged from three sources. */
export async function getBusy(force = false): Promise<{ intervals: [Date, Date][]; }>
```

Logic:
1. If `!force` and `CalendarCache.fetchedAt` is < 5 minutes old → parse `busyJson`/`eventIdsJson` and return.
2. If Google connected: `listEvents(now, now + horizonDays)` → build `intervals` (transparency/opaque both count as busy) and collect `eventIds`.
3. **Reconcile:** every `Appointment` with `status = "booked"` and a `googleEventId` **not present** in `eventIds` → update to `status = "cancelled-synced"`, fire-and-forget owner email "Booking TM-XXXXXX was removed from your Google Calendar — the slot is free again." (only when the connection exists; run at most once per appointment — the status change prevents repeats).
4. Persist cache row (`upsert`), set `fetchedAt`.
5. Google not connected → empty Google intervals, cache still written (so the path is uniform).

`computeAvailableSlots(serviceSlug, dateStr): Promise<string[]>` (times as `"HH:MM"` Perth):

1. Load service (must be active), settings, blocks for `dateStr`, and busy: `getBusy()` intervals **+ local `Appointment` rows** (`status = "booked"`, startsAt within horizon) as intervals **+ `ScheduleBlock`** intervals (all-day = whole day; ranged = its window).
2. Day checks: weekday in `schedDays` (JS: `getUTCDay()` of the Perth date with +8 offset — Sunday=0…Saturday=6 → map to 1–7 config), no all-day block.
3. Grid: from `perthDate(dateStr, schedStart)` stepping **30 minutes**; candidate `[t, t + durationMinutes]`.
4. Reject if `t < now + schedNoticeHours`, if `t + duration > perthDate(dateStr, schedEnd)`, or if the slot overlaps any busy interval with the buffer applied: for every busy `[bs, be]` reject when `t < be + buffer` AND `t + duration + buffer > bs` (i.e. ends-within-buffer-of-start on either side).
5. Return matching `"HH:MM"` strings (limit 40).

### 4.5 Reference + cancel tokens

- Appointment references reuse `src/lib/reference.ts` — extend `uniqueJobReference()` usage: add `uniqueAppointmentReference()` that checks the **Appointment** table (3 attempts).
- `cancelToken` = `crypto.randomBytes(16).toString("hex")` at booking time.

### 4.6 Emails (extend `src/lib/email.ts` style)

All fire-and-forget, skip when SMTP unconfigured:

- `sendAppointmentOwnerEmail(appointment)` — subject `[TechMate] New booking: {service} — {perthDayLabel} {time}`; body with all details + cancel hint ("cancel in admin or via the customer's link").
- `sendAppointmentCustomerEmail(appointment)` — friendly confirmation with **date/time, service, delivery, reference**, the cancellation link (`${NEXT_PUBLIC_SITE_URL}/cancel/${reference}?token=${cancelToken}`) and the policy note from settings.
- `sendAppointmentCancelledEmail(appointment, by)` — to the other party ("Your booking TM-XXXXXX for Friday 10 am has been cancelled…").
- `sendSyncRemovedEmail(appointment)` — owner notice for the reconciliation path.

Use `Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Perth", weekday: "long", day: "numeric", month: "long" })` for friendly day labels.

---

## PART 5 — ROUTES, ACTIONS & UI

### 5.1 Public

| Route | What |
|---|---|
| `/book` | The scheduler (replaces the old page). Client component `BookingScheduler` with the 5 steps (PART 1.1); chips scroll horizontally (phone-safe); service pre-select from `?service=`. |
| `/book/request` | The old `BookingForm` page, moved here verbatim + cross-link to `/book`. |
| `/cancel/[reference]` | Token-gated cancel page: shows booking summary (service, day/time — **no phone/email**), confirm button → `cancelAppointment` action → friendly "It's cancelled" panel. Wrong token → generic "This link doesn't seem right" + contact link. |

Public server actions in `src/lib/actions/calendar.ts`:

- `getSlots(formData)` — rate-limit **30 per 10 min** (`rateLimit(key, 30)`) — validates `serviceSlug` + `date` (YYYY-MM-DD, within horizon), returns `{ ok, slots: string[] }`. No secrets in the response.
- `bookAppointment(formData)` — rate-limit 5/10 min; `appointmentSchema` (below); loads service; computes start/end; **interactive transaction**: recompute busy (PART 4.4) inside the transaction, re-check the slot with buffer, then `appointment.create` — on failure return `{ ok: false, error: "Sorry — that time was just taken. Pick another and we'll get you sorted." }`; commit. After commit: fire-and-forget `createEvent` → persist `googleEventId` on success; send both emails. Return `{ ok, reference, summary }` for the confirmation panel.
- `cancelAppointment(formData)` — rate-limit 10/10 min; validates `reference` + `token` (timing-safe compare); only cancellable when `status = "booked"`; marks cancelled (`cancelledBy: "customer"`), best-effort `deleteEvent`, emails both parties.

`appointmentSchema` (add to `validation.ts`, reusing existing field schemas): name, email, phone, suburb, serviceSlug, delivery enum, date (`/^\d{4}-\d{2}-\d{2}$/`), slot (`/^([01]\d|2[0-3]):[0-5]\d$/`), address optional (max 200), notes optional (max 5000).

### 5.2 Admin (all under existing auth middleware; every action calls `requireAdmin()`)

| Route | What |
|---|---|
| `/admin/appointments` | DataTable (existing component): upcoming first — day/time (Perth labels), customer + contact, service/delivery/duration, status badge (`booked`/`cancelled`/`completed`/`no-show`/`cancelled-synced`), **Cancel** button (confirm dialog; server action, `cancelledBy: "owner"`), Google-synced indicator (event id present ✔ / not synced ⚠). |
| `/admin/calendar` | Connection card: status (Connected as {googleEmail} / Not connected), Connect → `buildAuthUrl` redirect (state cookie), Disconnect (deletes `CalendarConnection` + cache), **Sync now** (forces `getBusy(true)` + reconciliation, shows last synced). Blocks manager: list + add form (date, all-day or start/end time, reason) + delete. Known-limitations note (time edits in Google — cancel & rebook). |
| `/admin/calendar/callback` | OAuth callback: verify `state` against the `tm_oauth_state` httpOnly cookie (10-min expiry, set at connect); `exchangeCode`; on success store encrypted tokens + email (from the token's `id_token` payload or a `userInfo` fetch — simplest: decode the OAuth token response's `id_token` JWT payload without verification **for display only**), redirect to `/admin/calendar?connected=1`. On failure → `?error=…`. |
| Settings page | New scheduling fields (PART 2.3) with friendly labels. |
| Services content editor | New **duration** field (minutes, 15–240, step 15) in the service form. |
| Dashboard | New count card: upcoming appointments (next 7 days). |

Admin action additions in `src/lib/actions/admin.ts` (or a sibling `admin-calendar.ts`): `cancelAppointmentAdmin`, `addScheduleBlock`, `deleteScheduleBlock`, `disconnectGoogle`, `forceSync`, plus `saveService`/`saveSettings` extended for the new fields.

### 5.3 Navigation & SEO updates

- Header "Book now" and all existing `/book` links keep working (they now hit the scheduler).
- `sitemap.ts`: add `/book/request`; keep the rest.
- `/track` is **unchanged** in v1 of this phase (appointments are tracked via their own cancel link + reference in emails; adding appointment lookup to /track is a documented possible follow-up, not in scope).

---

## PART 6 — STATUS CONSTANTS

Add to `src/lib/statuses.ts`:

```ts
export const APPOINTMENT_STATUSES = ["booked", "cancelled", "completed", "no-show", "cancelled-synced"] as const;
export const CANCELLED_BY = ["customer", "owner"] as const;
```

plus labels: `booked: "Booked"`, `cancelled-synced: "Cancelled (removed from Google)"`, etc.

---

## PART 7 — OWNER DOCUMENTATION

`docs/CALENDAR_SETUP.md` — step-by-step for the owner (non-technical, screenshots not required):

1. Go to console.cloud.google.com → create project "TechMate".
2. APIs & Services → Library → enable **Google Calendar API**.
3. OAuth consent screen: External → app name "TechMate", support email yours → **Testing** mode → add `nsabharwal97@gmail.com` as a test user. (Testing mode is fine — it's your own account; refresh tokens keep working.)
4. Credentials → Create OAuth client ID → Web application → authorised redirect URI: `http://localhost:3000/admin/calendar/callback` (add the real domain later, at deployment).
5. Copy Client ID and Secret into `webapp/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), restart `npm run dev`.
6. Admin → Calendar → **Connect** → approve → back to "Connected".

Also update `docs/CONTENT_GUIDE.md`: duration field on services, availability settings, day blocks, and how cancellations work.

---

## PART 8 — IMPLEMENTATION ORDER (4 steps, verify each)

1. **Foundation:** schema changes + migration + duration SQL, settings keys + settingsSchema, `statuses.ts`, `time.ts`, `crypto.ts`, email additions. Verify: `npm run build` clean; admin settings + services editor show the new fields; lint + tsc clean.
2. **Scheduling engine + scheduler UI:** `schedule.ts` (`getBusy`, `computeAvailableSlots`), public actions, `BookingScheduler` component, `/book` + `/book/request` move, `/cancel/[reference]`, sitemap. **Test with Google NOT connected** (local-only mode). Verify: PART 9 items 1–6.
3. **Google two-way:** `google.ts`, `google-auth.ts`, admin calendar page + callback + disconnect + sync + blocks, booking → `createEvent` + `googleEventId`, reconciliation in `getBusy`, owner/Google cancellations. Verify: PART 9 items 7–10 (requires owner's Google setup from PART 7 — if not done, verify graceful not-configured paths and clearly mark the two-way items as "pending owner setup" in the phase report).
4. **Polish + docs:** dashboard card, admin appointments table refinements, phone-viewport sweep of new pages (390px, no wide elements, chips scroll), `docs/PHASE_4_5.md`, `docs/CALENDAR_SETUP.md`, `CONTENT_GUIDE` update, HANDOFF.md update, final build + lint + tsc.

---

## PART 9 — VERIFICATION CHECKLIST

**Local-only mode (no Google):**
1. Scheduler shows slots per service duration; booked slot disappears from a second visitor's list immediately.
2. Buffer respected (slot after a booking starts ≥30 min after its end); notice respected (no slots within 2 h); horizon respected (31st day unavailable); day blocks remove whole/partial days; `schedDays` excludes Sunday by default.
3. Booking persists an `Appointment`, sends both emails (SMTP configured), returns reference; **race test:** two rapid bookings of the same slot via curl/browser → exactly one succeeds, the other gets the friendly "just taken" message.
4. Cancel link works; slot reappears; emails sent; wrong token rejected generically.
5. `/book/request` still creates `BookingRequest` rows + emails; cross-links present.
6. Phone: 390px — no horizontal overflow, no zoomed layout viewport, chips scroll, inputs 16px.

**Two-way (after owner's Google setup):**
7. Connect flow completes; admin shows Connected; disconnect clears tokens + cache.
8. Booking creates a Google event with correct Perth time + details; appointment row stores `googleEventId`; the booked time disappears from public slots for other visitors.
9. An event the owner adds in Google manually blocks the matching public slots within 5 minutes (or after Sync now).
10. Owner deletes the booking event in Google → after refresh/Sync now: appointment becomes `cancelled-synced`, owner notified email, slot is bookable again.

**Every step:** lint + `tsc --noEmit` clean; no new dependencies in `package.json`; `.env.example` updated; no secrets committed.

---

## PART 10 — SECURITY ADDITIONS (must all hold)

- [ ] OAuth `state` random, httpOnly cookie, 10-min expiry, verified at callback (CSRF)
- [ ] Google tokens AES-256-GCM encrypted at rest; key derived from `SESSION_SECRET`
- [ ] New public actions rate-limited (`getSlots` 30/10min, `bookAppointment` 5/10min, `cancelAppointment` 10/10min) + zod-validated
- [ ] Booking re-validates slot availability **inside a transaction** (no double-booking race)
- [ ] Cancel token 128-bit random, timing-safe compare; cancel page shows only service + day/time (no contact details)
- [ ] All admin calendar/actions re-verify session (`requireAdmin()`)
- [ ] No customer PII in Google event titles (first name + suburb only; rest in description, owner-only)
- [ ] Errors from Google never surface raw to customers — friendly generic messages only
