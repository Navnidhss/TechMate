# Phase 4.5 — Live Scheduling + Google Calendar (Two-Way)

**Status:** Code complete and verified in local-only mode. Two-way Google items pending the owner's one-time Google Cloud setup (see `docs/CALENDAR_SETUP.md`). Phase 5 (deployment) remains locked.
**Date:** Session 11

---

## What Was Built

### Data & settings
- `Service.durationMinutes` (default 60) with a migration that sets sensible starting durations (computer-repair/new-setup/networking 90, data-recovery/sourcing 30, the rest 60). Editable in the services editor (15-minute steps, 15–240).
- Four new models: `Appointment`, `ScheduleBlock`, `CalendarConnection`, `CalendarCache` (per the phase spec).
- Seven new site settings, all admin-editable: working days, start/end time, horizon, minimum notice, buffer, cancellation policy note. Seed + `DEFAULTS` + zod validation updated.
- New status constants/labels: `booked`, `cancelled`, `completed`, `no-show`, `cancelled-synced`, and `cancelledBy` values.

### Scheduling engine
- `lib/time.ts` — deterministic Perth (UTC+8) date/time helpers, weekday numbering, friendly labels.
- `lib/schedule.ts` — `getBusy()` (Google events cached 5 minutes, reconciliation of deleted events, falls back to the last cache on Google errors) and `computeAvailableSlots()` (working days, all-day/partial blocks, 30-minute grid, per-service duration, notice, buffer, horizon, limit 40).
- `lib/actions/calendar.ts` — `getSlots` (30/10 min), `bookAppointment` (5/10 min, slot re-check inside a transaction so two people can't book the same time), `cancelAppointment` (10/10 min, timing-safe token, customer-only when booked). Bookings create the Google event best-effort after commit and persist `googleEventId`; emails are fire-and-forget.
- `lib/reference.ts` — `uniqueAppointmentReference()` (TM-XXXXXX, checked against Appointment).
- `lib/tokens.ts` — constant-time token comparison shared by the cancel page and action.

### Google integration
- `lib/google.ts` — dependency-free REST/OAuth client: auth URL, code exchange, refresh, paginated event listing (timed + all-day), event creation and deletion; `GOOGLE_CALENDAR_ID` respected (default `primary`).
- `lib/google-auth.ts` — connection lookup and an access token that auto-refreshes within 60 seconds; returns `null` (local-only mode) when not configured/connected or on any error.
- `lib/crypto.ts` — AES-256-GCM encryption of access/refresh tokens, key derived from `SESSION_SECRET`.
- `/admin/calendar` — connection card, Sync now, Disconnect (with confirm), day/time blocks manager, setup guidance when Google isn't configured, last-synced time, and the known time-move limitation.
- `/admin/calendar/connect` + `/admin/calendar/callback` — OAuth route handlers with a random `state` in an httpOnly 10-minute cookie, id_token email display, encrypted token storage, cache reset on connect/disconnect.
- Reconciliation: when a booked appointment's Google event disappears, it becomes `cancelled-synced`, the slot frees and the owner is emailed (once).

### Public booking
- `/book` is now a five-step scheduler (`BookingScheduler`): service (with duration/price) → delivery (limited to options that service supports) → day chips (server-built Perth dates) → time chips (live server action) → details → instant confirmation with reference and cancel link.
- Onsite bookings require an address; notes optional; suburb datalist from the seeded areas.
- `/book/request` keeps the original request form unchanged, with cross-links both ways. `/book` links from the header, service pages and pricing all keep working and pre-select the service.
- `/cancel/[reference]?token=…` — token verified before anything is shown; summary only (service, delivery, day/time, reference — no contact details); confirm cancels, frees the slot, deletes the Google event and emails both parties. Bad/expired links show a generic friendly message.
- Sitemap includes `/book/request`; cancel page is `noindex`.

### Admin & ops
- `/admin/appointments` — upcoming first, full details, sync indicator, cancel with confirmation; explanatory notes about Google behaviour.
- Admin cancel action (`cancelledBy: owner`), day-block add/delete, disconnect and force-sync actions — all guarded by `requireAdmin()` (now shared via `lib/admin-auth.ts`).
- Dashboard gains an "Appointments (7 days)" card and quick links.
- Emails added: owner new-booking, customer confirmation (with cancel link + policy), owner/customer cancellation, owner sync-removed notice.

## Key Files

| Path | Purpose |
|---|---|
| `prisma/schema.prisma` + migration | Appointment/ScheduleBlock/CalendarConnection/CalendarCache + durations |
| `src/lib/{time,schedule,google,google-auth,crypto,tokens,reference}.ts` | Engine + Google + security helpers |
| `src/lib/actions/calendar.ts`, `admin-calendar.ts` | Public and admin actions |
| `src/components/forms/{BookingScheduler,CancelBookingForm}.tsx` | Scheduler + cancel UI |
| `src/app/(public)/book`, `book/request`, `cancel/[reference]` | Public routes |
| `src/app/admin/calendar*`, `(portal)/appointments` | Admin calendar + appointments |
| `docs/CALENDAR_SETUP.md` | Owner's Google Cloud guide |

## Verification Results

### Local-only mode (Google not connected) — all passed

| Check | Result |
|---|---|
| Slots use the service duration | ✅ 90-min service → slots every 30 min, last start 16:30 (ends 18:00) |
| Booking removes the slot | ✅ 08:00 booking → first slot becomes 10:00 |
| 30-minute buffer | ✅ 08:30–09:30 also removed after a 08:00–09:30 booking |
| Duplicate booking | ✅ Rejected: "Sorry — that time isn't available any more." |
| Race (two simultaneous bookings of the same slot) | ✅ Exactly one succeeded; the other got "Sorry — that time was just taken…" |
| Minimum notice | ✅ No slot earlier than now + 2 h (server-side check) |
| Horizon | ✅ 40 days out rejected with "outside the booking window"; booking action also re-checks |
| All-day block | ✅ Day returns 0 slots; removal restores them |
| Sunday (`schedDays=1..6`) | ✅ 0 slots |
| Booking persists + reference | ✅ `TM-XXXXXX`, correct start/end/duration snapshot |
| Emails | ✅ Owner notification + customer confirmation (with cancel link/policy) sent via Gmail SMTP |
| Cancel link page | ✅ Shows only reference/service/delivery/time; no email, phone or name leaked |
| Wrong token page | ✅ Generic "This link doesn't seem right"; name not leaked |
| Cancel action | ✅ Wrong token rejected; valid cancel frees the slot; replay → "no longer active"; both emails sent |
| `/book/request` | ✅ Still creates BookingRequest rows + owner email |
| Mobile 390 px sweep (headless Edge/CDP, 9 routes incl. `/book`, `/cancel`) | ✅ `innerWidth = scrollWidth = 390` everywhere — no horizontal overflow |
| Lighthouse `/book` (production) | ✅ 98 performance, 100 accessibility, 100 SEO |

### Admin checks — all passed

| Check | Result |
|---|---|
| `/admin/appointments`, `/admin/calendar`, dashboard | ✅ 200 |
| Admin cancel | ✅ Status `cancelled`, `cancelledBy: owner`, customer emailed |
| Add/delete schedule block | ✅ Persisted and removed |
| Service duration save | ✅ 120 persisted, then restored to 90 |
| Scheduling settings save | ✅ Buffer 45 persisted, then restored to 30 |
| Force sync without Google | ✅ Succeeds (writes empty cache); no errors |
| Google not configured UI | ✅ "Local availability only" + setup guidance; Connect route redirects to `?error=not-configured` |
| Google configured but not connected (dummy env) | ✅ "Connect Google Calendar" shown; Connect redirects to Google with the correct redirect URI |
| OAuth state protection | ✅ Callback with a wrong state redirects to the friendly error, no token exchange |
| Google disconnected | ✅ Token/cache rows deleted, scheduler continues locally |

### Two-way items (pending owner's Google setup)

Items 7–10 of the phase checklist (real connect, event creation with Perth times, Google events blocking slots, deletion reconciliation) could not be exercised without live Google credentials. The code paths are implemented and all graceful failure paths are verified. `docs/CALENDAR_SETUP.md` contains the owner's setup steps; after connecting, these four checks should be run once.

## Deviations & Open Questions

1. **Google libs implemented in Step 2** (they are needed by `schedule.ts`), with the admin/OAuth UI in Step 3 as planned.
2. **`requireAdmin` moved to `src/lib/admin-auth.ts`** so the new calendar actions share the exact same guard; behaviour unchanged.
3. **Extra email** `sendAppointmentCustomerCancelledEmail` — the spec's `sendAppointmentCancelledEmail(appointment, by)` only emails "the other party", but §1.3 asks for both parties on a customer cancellation.
4. **Connect/callback are route handlers** rather than pages, so they don't render admin chrome; URLs are exactly `/admin/calendar/connect` and `/admin/calendar/callback` and middleware still protects them.
5. **Address is required for onsite bookings** (extra safeguard; the spec has address optional). Remote/workshop ignore it.
6. **Horizon re-check added to `bookAppointment`** (defence in depth) in addition to `getSlots`.
7. **`GOOGLE_CALENDAR_ID`** is honoured with `primary` as the default, matching the spec's target calendar.
8. **OAuth testing-mode caveat:** Google expires refresh tokens after ~7 days while the OAuth app is in "Testing". The setup guide recommends publishing the app (unverified is fine for the owner's own use) so tokens keep working, or reconnecting weekly if left in testing. This corrects the plan's "testing mode is fine" note.
9. **Cancel-page confirmation** uses a simple server action with a client pending state; admin cancel uses a `window.confirm` dialog.
10. **Time-moved-in-Google limitation** is documented in admin and the setup guide (cancel & rebook).
11. **`NEXT_PUBLIC_SITE_URL` now added to `.env.example`** (closes verifier finding F1); it is used for sitemap, job-update emails and cancellation links. The verifier's F2 (fail fast on missing `SESSION_SECRET`) remains a Phase 5 deployment checklist item.

## Open Questions

- Owner must complete the Google Cloud setup (client ID/secret) before two-way sync can be verified or used. The scheduler is fully usable without it.
- Final business name, domain, AnyDesk copy and ABN still outstanding (tracked in `HANDOFF.md` §4).
