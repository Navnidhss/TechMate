# Phase 3 — Admin Portal

**Status:** Complete (awaiting owner review before Phase 4)
**Date:** Session 5

---

## What Was Built

### Authentication & session
- `src/lib/session.ts` — the plan's exact HMAC-signed session token code (Node runtime), with a TypeScript-safe fallback for the secret.
- `src/lib/session-edge.ts` — Web Crypto mirror of the same HMAC verification, because Next.js middleware runs on the Edge runtime which does not support Node's `crypto.createHmac`. Token format, secret and encoding match `session.ts`.
- `src/middleware.ts` — protects every `/admin/*` path except `/admin/login`, redirecting to login with a `?next=` return path.
- `/admin/login` — clean login card; generic "Incorrect username or password." for any failure; login attempts rate-limited at 5 per 10 minutes per IP.
- `/admin/change-password` — requires a valid session; verifies the current password, enforces min 10 characters and "must differ from the current password", clears `mustChangePassword`.
- First-login enforcement — login redirects to change-password when the flag is set, and the admin layout redirects any other admin page there until it is cleared.
- `/admin/logout` — POST-only route that clears the cookie and returns to login.
- Every admin server action calls `requireAdmin()` itself (session signature + user still exists), so actions are never protected by middleware alone.

### Admin shell
- Auth-gated layout with a fixed sidebar (Dashboard, Bookings, Enquiries, Quotes, Recoveries, Remote, Jobs; Content: Services, FAQ, Areas, Settings; Change password, View website, Log out).
- Mobile layout collapses to a horizontal scrolling nav; dense, functional styling using the same design tokens.
- Dashboard: count cards (new bookings, new enquiries, new recoveries, active jobs) and the five most recent submissions across all forms, plus quick links to content editors.

### Submission management
- One shared `DataTable` component used by all five submission pages: timestamp, name, contact, summary, colour-coded status badge, instant-save status dropdown, "View full details" expansion.
- Status dropdowns submit through a server action and revalidate the page. Without JavaScript, a "Save" button still works.
- Allowed statuses per model are validated against `lib/statuses.ts` server-side (no arbitrary statuses can be written).
- Bookings page also shows the linked job reference or a **Create job** button.

### Jobs & customer tracking codes
- `src/lib/reference.ts` — `TM-XXXXXX` codes from an alphabet without I/O/0/1, checked for uniqueness with up to 3 attempts.
- "Create job" builds a job from a booking (customer details, suburb, service summary, initial customer note), auto-generates the reference, links the booking and marks the booking confirmed, then opens the job.
- Jobs list: reference, customer, work summary, last-updated time, status badge and quick status dropdown (emails the customer if the status moves).
- Job detail page: customer card, booking details, and a clear separation between:
  - **Customer update** — plain-English note, shown on the future tracking page and emailed to the customer;
  - **Private notes** — admin-only, never exposed.
- Saving a changed status or customer update emails the customer: subject `[TechMate] Update on your job TM-XXXXXX`.

### Content editors (the CMS)
- **Services:** add new (slug, name, summary, description, delivery checkboxes, price, price note, icon, order), inline edit for every existing service, hide/show on the public site, and delete — blocked with a friendly explanation if any booking references the service (deactivate instead). Slugs are fixed after creation so existing links and bookings stay valid.
- **FAQ:** add, edit (question, answer, order), delete.
- **Service areas:** add a suburb under an existing or new zone (with datalist suggestions), remove a suburb, grouped view by zone.
- **Settings:** business name, tagline, ABN, contact email, contact phone, trading hours, workshop/drop-off details, AnyDesk instructions — all with plain-English explanations. Changing `contactEmail` instantly redirects all enquiry notifications to the new address.
- All editors validate with zod, show success/error banners, and call `revalidatePath()` so public pages (including the statically generated service detail pages) update immediately.

## Key Files

| Path | Purpose |
|---|---|
| `src/lib/session.ts` | Exact spec session token creation/verification |
| `src/lib/session-edge.ts` | Web Crypto verification for Edge middleware |
| `src/middleware.ts` | `/admin/*` route protection |
| `src/lib/actions/admin.ts` | Login, password change, status updates, jobs, all content CRUD |
| `src/app/admin/(portal)/layout.tsx` | Auth-gated admin shell (double-checks session) |
| `src/app/admin/login`, `change-password`, `logout` | Authentication pages/route |
| `src/app/admin/(portal)/*` | Dashboard, tables, jobs, content editors |
| `src/components/admin/*` | Sidebar, DataTable, StatusBadge, StatusSelect, SubmitButton, CreateJobButton, banners, forms |

## Verification Results

| Check | Result |
|---|---|
| `npm run build` | ✅ Passes |
| `npx eslint src prisma` | ✅ Clean |
| Unauthenticated `/admin`, `/admin/bookings`, `/admin/jobs`, `/admin/content/*` | ✅ 307 → `/admin/login?next=…` |
| Invalid session cookie | ✅ Rejected (signature check) |
| Wrong password | ✅ Generic "Incorrect username or password." (no user enumeration) |
| Correct starter password | ✅ Login succeeds, redirects to `/admin/change-password` (first login) |
| Admin layout guard | ✅ Valid session with pending password change redirects every admin page to change-password |
| Change password — wrong current | ✅ Field error |
| Change password — same as current | ✅ Field error ("choose a password you haven't used before") |
| Change password — valid | ✅ Saves; old password stops working; new password logs in to `/admin` |
| Login rate limiting | ✅ 5 attempts / 10 min per IP |
| Status dropdown save | ✅ Persists to SQLite and revalidates (booking tested) |
| Create job from booking | ✅ Job created, valid `TM-XXXXXX` reference, booking marked confirmed |
| Job update | ✅ Status, customer note and private note persist |
| Job quick status | ✅ Persists and sends the customer update email |
| Customer job email | ✅ `[TechMate] Update on your job TM-8G9UUS` accepted by SMTP |
| Service edit / hide / restore | ✅ Saves and revalidates |
| Service delete with linked booking | ✅ Blocked with "deactivate instead" guidance |
| FAQ create/delete | ✅ Works |
| Area create/delete | ✅ Works (zone + suburb), duplicates rejected |
| Settings save | ✅ Persists; contact phone change verified and reverted |
| All admin pages render | ✅ 200 (dashboard, five tables, jobs, job detail, four content editors) |
| Test data cleanup | ✅ All test jobs/bookings/FAQs/areas deleted; settings, services and admin password restored; temporary test endpoint removed |

## Deviations & Open Questions

1. **Route group `(portal)`** — the portal pages live in `src/app/admin/(portal)/` so the forced password-change redirect (in the portal layout) doesn't trap the change-password page itself. URLs are unchanged (`/admin`, `/admin/jobs`, …).
2. **Edge session verification** — the plan's middleware imports `verifySessionToken`, but Edge cannot use Node's `crypto.createHmac`. `session-edge.ts` reimplements the same HMAC check with Web Crypto; both implementations must be kept in sync (documented in the file). `session.ts` remains the source of truth for all Node-side cookie work.
3. **`session.ts` type-safety tweak** — `process.env.SESSION_SECRET ?? ""` inside `sign()` so TypeScript strict passes; behaviour is identical when the (required) env var is set.
4. **Login failures are rate-limited** with the same in-memory limiter as public forms (5 / 10 min per IP).
5. **Content feedback via query params** (`?saved=…`, `?error=…`) rather than client-side state, so the editors work without extra client components; the forms use server actions and `<SubmitButton>` pending states.
6. **Service slugs are immutable once created** to protect existing links and bookings; the slug field is only editable on the "add service" form.
7. **Deleting a service** is only allowed when no bookings reference its slug; otherwise the owner is told to hide it instead.
8. **Quick status change from the jobs list** emails the customer their current customer note (the same note the tracking page will show), so they aren't left guessing.
9. **`revalidatePath()` on content saves** resolves the Phase 1 SSG caveat: service detail pages refresh as soon as the owner saves.
10. **Extra admin components** beyond the file tree: `AdminPageHeader`, `AdminBanner`, `CreateJobButton`, `LoginForm`, `ChangePasswordForm` — all small and single-purpose.
11. **`QUOTE_STATUSES` / `REMOTE_STATUSES`** (added in Phase 1) are now used by their admin tables; the spec's schema has status columns for those models but only listed three status sets.

## Open Questions

None blocking. Owner still to supply: final business name, domain, AnyDesk ID copy, ABN (tracked in `HANDOFF.md` §4).
