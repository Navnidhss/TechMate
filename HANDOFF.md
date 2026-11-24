# HANDOFF.md — TechMate Web Application

> **Purpose of this file:** A living handoff document. Anyone (human or AI assistant) should be able to read this file alone and pick up exactly where the last session left off. This is maintained across ALL phases and is **separate from BUILD_PLAN.md**.
>
> **Rule:** Update this file at the end of every work session, after completing any phase/milestone, and whenever a decision changes.

---

## 1. Project Snapshot

| Item | Value |
|---|---|
| Business name | **TechMate** (working placeholder — final name TBD) |
| Location | Western Australia — whole Perth metro |
| Venture status | New venture — all copy is drafted placeholder content |
| Contact email | `nsabharwal97@gmail.com` **(stored in one config location for easy change — never hardcode elsewhere)** |
| Operator model | Solo (onsite home visits + remote help via AnyDesk) |
| Hosting | Local build only for now; domain not yet purchased; free-tier deployment planned |
| Repo location | `C:\Users\Nav\Documents\TechMate` (Desktop shortcut: `TechMate.lnk`) |

---

## 2. Client Decisions Log (record of answers)

These are the owner's confirmed answers as of project kickoff:

1. **Market:** Western Australia (Perth metro, whole metro area).
2. **Name:** No name yet — using **TechMate** as placeholder. Logo to be generated as placeholder.
3. **Service area:** Whole metro.
4. **Content:** New venture — assistant drafts all realistic placeholder copy (services, pricing, FAQs) for owner to edit later.
5. **Feature scope (v1):** Everything **except the shop** — brochure site, booking requests, quote/intake forms, customer portal, **plus an admin portal/dashboard**. (Shop is a future phase.)
6. **Payments:** Enquiry-only for v1 (no online payment). Owner calls/invoices.
7. **Staffing:** Solo operator for this phase.
8. **Delivery model:** Onsite home visits + remote support via **AnyDesk**.
9. **Stack priority:** Whatever is lowest cost / free.
10. **Hosting:** Free tiers only.
11. **CMS/content editing:** Yes — owner must be able to edit content without touching code.
12. **Domain:** Not purchased yet. Building locally for now.
13. **Logo:** Generate a placeholder logo.
14. **Design:** Modern, clean, user-friendly for non-tech-savvy people, but a little unique (not a cookie-cutter template).
15. **Extra services beyond the originals:** virus removal, small business managed IT.
16. **Enquiries go to:** `nsabharwal97@gmail.com` — must be easy to change later.
17. **Admin:** Include a dashboard.
18. **SEO:** Yes, prioritised (local/suburb SEO, Google Business Profile ready).
19. **File location:** Project in `Documents`, shortcut on Desktop. Keep a record of answers (this section).
20. **Non-negotiable goals:** easy maintainability, content editability, security, proper documentation.
21. **Process:** Maintain HANDOFF.md (this file) across all phases, separate from the build plan.

Full original service list (from kickoff): onsite / workshop / remote computer repair, IT support, data recovery, hardware & software sales (shop = future phase), virus removal, small business managed IT, "and much more."

---

## 3. Non-Negotiable Principles (apply to every phase)

1. **Maintainability** — clear folder structure, small components, commented config, consistent naming.
2. **Content editability** — ALL editable content (services, pricing, FAQs, contact email, suburb lists) lives in data files / CMS, never scattered in page code.
3. **Security** — validate all form input server-side, hash admin passwords, rate-limit form endpoints, never commit secrets, HTTPS-only cookies, no client-trusted data.
4. **Proper documentation** — every phase documented; docs live in `/docs`; README kept accurate; this HANDOFF.md always current.

---

## 4. Current Status

- **Phase:** 4.5 complete in **local-only mode** — live scheduler, per-service durations, configurable availability, cancellations, admin appointments/calendar, and all Google Calendar integration code (two-way sync) are built and verified. **Two-way Google items await the owner's one-time Google Cloud setup** (guide: `webapp/docs/CALENDAR_SETUP.md`). Phase 5 (deployment) remains off-limits until the owner authorises it.
- **Last updated:** Session 11 (Phase 4.5 implementation)
- **What's done:**
  - **Phase 1:** `webapp/` scaffolded (Next.js 15, TypeScript strict, Tailwind 4, App Router, `src/`); Prisma schema + migration + SQLite `dev.db`; idempotent seed (9 services, 8 FAQs, 64 suburbs, 8 settings, starter admin `admin` / `TechMateAdmin2025!`); design system + logo; full public site (home, services + 9 detail pages, pricing, areas, about, FAQ, contact, privacy, 404); SEO (metadata, JSON-LD, sitemap, robots); `docs/PHASE_1.md`
  - **Phase 2:** `validation.ts` (all zod schemas + human messages), exact `rate-limit.ts` (5 per 10 min per action+IP), `email.ts` (Gmail SMTP, owner notification + customer acknowledgement, graceful skip if unconfigured), five public server actions, five forms with inline errors/pending/success states, shared form controls. Owner notification recipient comes from the editable `contactEmail` setting. `docs/PHASE_2.md`
  - **Phase 3:** signed-cookie auth (`session.ts` exact + Edge-safe verification for middleware), login/logout/forced first-login password change, protected `/admin/*`, admin shell + dashboard, five request tables with instant-save statuses, jobs module (create from booking, `TM-XXXXXX` references, customer update vs private notes, automatic customer update emails), and content editors for services, FAQs, service areas and settings — with `revalidatePath()` so public pages refresh immediately. `docs/PHASE_3.md` + `docs/CONTENT_GUIDE.md`
  - **Phase 4:** customer `/track` lookup (rate-limited, reference-validated, returns only status + customer note + last-updated; generic failures), accessibility pass (WCAG AA contrast fixes, labelled controls, Escape/focus handling, `aria-current`, descriptive links), Lighthouse 98 performance / 100 accessibility / 100 best-practices / 100 SEO on the home page, and the complete security checklist. `docs/PHASE_4.md`
  - **Phase 4.5:** `/book` is now a five-step live scheduler (instant booking, per-service durations, configurable days/hours/horizon/notice/buffer, cancellation policy) while the request form lives on at `/book/request`. Two-way Google Calendar integration (create events, busy events block slots, deletion reconciliation), token-encrypted OAuth connection, customer cancel links, admin Appointment list with cancel, admin Calendar page (connect/sync/disconnect/day blocks), dashboard appointment card. `docs/PHASE_4_5.md` + `docs/CALENDAR_SETUP.md`; CONTENT_GUIDE updated.
  - Gmail SMTP verified (owner's app password stored only in git-ignored `.env`)
  - Build + ESLint clean; public booking/cancel flows, admin actions, race protection and emails verified end-to-end; 390px phone sweep clean; `/book` Lighthouse 98/100/100.
- **What's NOT done:**
  - **Two-way Google verification** — needs the owner to complete the Google Cloud setup (client ID/secret), connect, and run the four checks in `docs/CALENDAR_SETUP.md` §7. Everything works locally without it.
  - **Phase 5 deployment** — hosting, hosted database migration (SQLite → Postgres/Turso), domain and DNS. **Do not start until the owner explicitly authorises it.**
- **Blockers / open questions:**
  - [ ] Owner completes Google Cloud setup + connects Google Calendar (then verify booking→event, Google→slots, delete→reconcile)
  - [ ] Final business name (TechMate is placeholder)
  - [ ] Domain purchase (needed for Phase 5)
  - [ ] AnyDesk ID / remote-support details for the site copy
  - [ ] ABN (must be displayed on an AU business site once available)
  - [ ] Owner decision to begin Phase 5 (deployment)

---

## 5. How to Run

```bash
cd C:\Users\Nav\Documents\TechMate\webapp
npm install          # first time only
npx prisma migrate dev   # first time only (creates prisma/dev.db)
npm run db:seed          # first time only (or after a DB reset)
npm run dev              # http://localhost:3000
```

- Production check: `npm run build` then `npm start`.
- Admin portal: <http://localhost:3000/admin> (the owner has changed the starter password; the seeded `admin` / `TechMateAdmin2025!` is no longer live).
- Live booking: `/book` (scheduler) and `/book/request` (request form). Google Calendar setup: `webapp/docs/CALENDAR_SETUP.md`; without credentials the scheduler uses local availability only.
- Inspect the database: `npx prisma studio`.
- Reset local data: `npx prisma migrate reset` then `npm run db:seed`.
- `.env` holds local secrets (already created, git-ignored). Gmail SMTP is configured and verified; enquiry emails go to the `contactEmail` setting (currently `nsabharwal97@gmail.com`).
- Full details (env vars, scripts, structure): `webapp/README.md`.

---

## 6. Where Everything Lives

| Path | Purpose |
|---|---|
| `Documents/TechMate/HANDOFF.md` | This file — session-to-session handoff (always current) |
| `Documents/TechMate/BUILD_PLAN.md` | The phase-by-phase build plan (reference, not a status log) |
| `Documents/TechMate/IMPLEMENTATION_PLAN.md` | Authoritative code-level spec handed to the implementing model (DeepSeek v4.1 Flash) |
| `Documents/TechMate/START_PROMPT.md` | Kickoff prompt to paste into the implementing model's session |
| `Documents/TechMate/IMPLEMENTATION_PLAN_4.5.md` | Phase 4.5 authoritative spec — live scheduling + two-way Google Calendar |
| `Documents/TechMate/START_PROMPT_4.5.md` | Phase 4.5 kickoff prompt for the implementing model |
| `Documents/TechMate/VERIFICATION_REPORT.md` | Independent audit of Phases 1–4 (all verified; minor findings listed inside) |
| `Documents/TechMate/webapp/` | The application code |
| `Documents/TechMate/webapp/README.md` | Setup, run, env vars, structure |
| `Documents/TechMate/webapp/docs/PHASE_1.md` | Phase 1 report: what was built, verification, deviations |
| `Documents/TechMate/webapp/docs/PHASE_2.md` | Phase 2 report: forms, validation, rate limiting, email |
| `Documents/TechMate/webapp/docs/PHASE_3.md` | Phase 3 report: auth, admin portal, jobs, content editors |
| `Documents/TechMate/webapp/docs/PHASE_4.md` | Phase 4 report: tracking, accessibility, performance, security checklist |
| `Documents/TechMate/webapp/docs/PHASE_4_5.md` | Phase 4.5 report: scheduler, Google sync, verification, deviations |
| `Documents/TechMate/webapp/docs/CALENDAR_SETUP.md` | Owner's Google Cloud / Calendar setup guide |
| `Documents/TechMate/webapp/docs/CONTENT_GUIDE.md` | Owner's no-code guide to running the site |

---

## 7. Session Log

| Date | Phase | Summary |
|---|---|---|
| Kickoff | 0 | Questions asked, all decisions recorded, project directory + Desktop shortcut created, handoff + build plan written. Awaiting go-ahead to begin Phase 1 scaffold. |
| Session 2 | 0 | Created `IMPLEMENTATION_PLAN.md` (full code-level spec: stack, folder structure, Prisma schema, seed content, form/validation/email/auth specs, phase-by-phase verification checklists) and `START_PROMPT.md` (kickoff prompt with reading order, working rules, reporting format). Project ready to hand to the implementing model. |
| Session 3 | 1 | **Phase 1 complete.** Scaffolded Next.js 15 app in `webapp/`, configured Prisma 6 + SQLite, wrote and ran the idempotent seed (9 services, 8 FAQs, 64 suburbs, 8 settings, admin user), built the design system (teal/amber tokens, Sora + Inter), logo assets, public layout (header/footer), and all public pages incl. 9 service detail pages, pricing, areas, about, FAQ, contact, privacy and friendly 404. Added SEO (metadata, JSON-LD, sitemap, robots) and `docs/PHASE_1.md`. Verified: build + ESLint clean, every route 200, content proven to come from the DB. Form pages and `/track` are friendly placeholders until Phases 2 & 4. Awaiting go-ahead for Phase 2. |
| Session 4 | 2 | **Phase 2 complete.** Added `validation.ts` (all zod schemas, human error messages), exact `rate-limit.ts`, `email.ts` (Gmail SMTP owner notification + customer acknowledgement, graceful skip when unconfigured) and five public server actions. Built all five forms (booking with service pre-select, suburb datalist and delivery/time radios; contact; quote; data recovery with enforced consent; remote support) plus shared form controls, inline field errors, pending and success states. Owner supplied a Gmail app password; SMTP verified. Verified end-to-end: real DB rows, real emails, invalid-input messages, rate limiting at 5/10 min, consent enforcement, and `contactEmail` setting change routing notifications to the new address. `docs/PHASE_2.md` written; build + ESLint clean. Awaiting go-ahead for Phase 3 (admin portal). |
| Session 5 | 3 | **Phase 3 complete.** Built signed-cookie auth (`session.ts` exact + Edge-safe verification), middleware route protection, login/logout, forced first-login password change, admin shell/sidebar, dashboard, five request tables with instant-save statuses, jobs module (create from booking, `TM-XXXXXX` references, customer vs private notes, automatic update emails) and full content editors for services, FAQs, areas and settings with `revalidatePath()`. Verified end-to-end via real actions: unauthenticated redirects, generic login errors, forced password change, old/new password behaviour, status updates, job creation/update/emails, service edit/hide/delete-blocked, FAQ/area CRUD, settings persistence, and all admin pages rendering 200. Wrote `docs/PHASE_3.md` and `docs/CONTENT_GUIDE.md`; project committed and pushed to GitHub. Awaiting go-ahead for Phase 4. |
| Session 6 | 4 | **Phase 4 complete.** Implemented `/track` (rate-limited `lookupJob` returning only reference, status, customer note and last-updated; generic failures) with the `TrackForm` UI; accessibility pass (WCAG AA contrast fixes, labels/aria, Escape + focus handling, descriptive link text); SEO link-text fixes. Lighthouse on a production build: home 98 performance, 100 accessibility, 100 best practices, 100 SEO; service page 98/100; `/track` 100 accessibility. Ran and recorded the full security checklist; all items pass. Build + ESLint clean. `docs/PHASE_4.md` written; all build phases complete. Phase 5 (deployment) awaits owner authorisation. |
| Session 7 | 4 | **Independent verification of Phases 1–4** (different reviewer, no implementation involvement). All claims reproduced: build/lint clean, 30 routes verified, DB state matches spec, all 11 security-checklist items pass with evidence, forged + expired session tokens blocked, rate limiting engages at 5/10 min, end-to-end booking + tracking proven via real headless-Edge browser automation, independent Lighthouse home 100/100/100/100. **Verdict: Phases 1–4 confirmed complete.** Minor findings recorded in `VERIFICATION_REPORT.md` §5: add `NEXT_PUBLIC_SITE_URL` to `.env.example` (F1), fail fast on missing `SESSION_SECRET` (F2), rate-limit bucket note (F3), sitemap lastmod (F4), app-password rotation hygiene note (F5) — none blocking; F1/F2 to fold into Phase 5 checklist. One automated test booking was created and deleted; owner's trial booking/job untouched. |
| Session 8 | 4 | **Mobile responsiveness verified + two fixes applied.** Phone-viewport (390×844, touch emulation) sweep of 11 public pages: no horizontal overflow anywhere (pricing table swipes inside its scroll card by design — proven via touch-scroll test); hamburger menu, FAQ accordion, booking form and track lookup all work end-to-end on phone. **Fix 1:** form inputs were 14px → iOS Safari zooms the page on field focus; bumped `.input/.textarea/.select` to 16px in `globals.css` (re-verified 16px live). **Fix 2:** footer service/quick/contact links were sub-24px touch targets; added `py-1` padding (re-verified). Remaining sub-24px links are inline sentence links (WCAG 2.5.8 inline exception) and the keyboard-only skip link — acceptable. Lint + tsc clean. Note: `next dev` server holds the Prisma DLL on Windows — stop it before running `npm run build`. |
| Session 9 | 4 | **Pricing phone zoom-out fixed (owner-reported, confirmed real).** The 640px-min pricing table expanded the mobile layout viewport → whole page renders zoomed out on phones (initial session-8 dismissal as an emulation artifact was wrong — owner reproduced it on a real device). Fix: `/pricing` now renders stacked per-service price cards below `sm` and the full table only at `sm+`; verified at 390px (layout viewport stays 390, doc scroll 390, 9 cards render, table hidden) and at 1280px (table + 9 rows intact, no overflow). Admin `DataTable` checked — uses `min-w-0` containment, no same bug. All other pages re-swept clean; lint + tsc clean. **Env-value audit:** grepped every project file + full git history for the real `SESSION_SECRET` / Gmail app-password values — none present anywhere in docs or history; only locations are the git-ignored `.env` and the verifier's chat log (owner advised to rotate the app password if that log is ever shared). |
| Session 10 | 4.5 | **Phase 4.5 planned (owner confirmed all 8 decisions):** two-way Google Calendar (bookings create events; Google busy blocks slots; owner deleting an event frees the slot via reconciliation), instant booking, availability Mon–Sat 8–6 / 30-day horizon / 2h notice / 30m buffer (admin-editable), per-service durations (content-editor editable), cancellations both (customer token link + owner admin/Google), `/book` becomes the live scheduler while the request form survives at `/book/request`, Google account `nsabharwal97@gmail.com`, policy-note no-show protection. Wrote `IMPLEMENTATION_PLAN_4.5.md` (schema: Service.durationMinutes + Appointment/ScheduleBlock/CalendarConnection/CalendarCache; exact code for AES token encryption, Perth UTC+8 helpers, slot engine, fetch-based Google OAuth/REST; 4-step order + 10-item verification + 8 security requirements; zero new dependencies) and `START_PROMPT_4.5.md` (reading order, working rules incl. the Windows dev-server/Prisma-DLL lock, reporting format). No implementation started — awaiting handoff to DeepSeek. |
| Session 11 | 4.5 | **Phase 4.5 complete (local-only verified; two-way pending owner setup).** Added `Service.durationMinutes` + 4 models (migration with sensible starting durations), 7 editable scheduling settings, Perth time helpers, AES-GCM token encryption, slot engine (working days, hours, horizon, notice, buffer, blocks, Google busy cache + reconciliation), public actions (`getSlots`, `bookAppointment` with transactional race protection, `cancelAppointment` with timing-safe tokens), five-step scheduler at `/book`, request form moved to `/book/request`, token-gated `/cancel/[reference]`, admin Appointments list + cancel, admin Calendar (Connect/Sync/Disconnect/day blocks), OAuth connect+callback routes, dashboard card, and appointment emails (owner, customer, cancellations, sync-removed). Verified: slot durations/buffer/notice/horizon/blocks/Sunday, duplicate + simultaneous booking race (exactly one winner), cancel page leaks nothing, wrong-token/replay rejection, slot reopened, emails sent, `/book/request` intact, 390px sweep on 9 routes with zero overflow, `/book` Lighthouse 98/100/100, admin actions + graceful not-configured/configured-not-connected/state-CSRF paths. Wrote `docs/PHASE_4_5.md` + `docs/CALENDAR_SETUP.md`; CONTENT_GUIDE and README updated. Two-way Google checks await owner credentials. |

---

## 8. Phase 1 — Detailed Record (Complete)

**Goal:** a working, styled public website whose content comes from the database, on a maintainable codebase, with SEO basics in place.

### 8.1 What was delivered

| Area | Detail |
|---|---|
| Scaffold | Next.js 15 App Router, React 19, TypeScript `strict`, Tailwind CSS 4, ESLint, `src/` directory, `@/*` alias. Dependencies limited to the plan's list: `prisma`/`@prisma/client` 6.19.3, `zod`, `bcryptjs`, `nodemailer`, `tsx` (dev). |
| Environment | `.env` (git-ignored) + `.env.example` with every variable; real 64-hex `SESSION_SECRET` generated; Gmail SMTP placeholders until Phase 2. |
| Database | Prisma schema implemented exactly per spec: `SiteSetting`, `Service`, `Faq`, `ServiceArea`, `BookingRequest`, `Enquiry`, `QuoteRequest`, `DataRecoveryIntake`, `RemoteSupportRequest`, `Job`, `AdminUser`. `init` migration applied to SQLite (`prisma/dev.db`). |
| Seed | Idempotent seed (create-if-missing, so owner edits are never overwritten): 9 services with full plain-English descriptions, 8 FAQs, 64 suburbs across 9 Perth zones, 8 site settings, starter admin. Re-running never duplicates. |
| Design system | Tailwind 4 `@theme` tokens (deep teal primary, amber accent, ink/body/muted text, surface/card/line, success/danger), Inter + Sora via `next/font`, shared CSS component classes (`.card`, `.btn-primary`, `.btn-accent`, `.btn-outline`, `.pill`, `.input`, `.field-*`, `.heading-bar`, `.hero-glow`, `.prose-plain`). |
| Branding | `public/logo.svg` and `logo-mark.svg` (exact spec SVG), `favicon.svg` referenced from metadata. Wordmark renders "Tech" in ink + "Mate" in primary. |
| Layout | Sticky header (nav, phone link, amber "Book now", accessible mobile menu), footer built from DB settings (services, quick links, contact, ABN line, small print), skip link, `<html lang="en-AU">`. |
| Pages built | `/` (hero + delivery pills + trust strip + top-6 services + how-it-works + data-recovery band + FAQ teaser + CTA), `/services`, `/services/[slug]` (9 pages), `/pricing`, `/service-areas`, `/data-recovery`, `/remote-support`, `/quote`, `/book`, `/about`, `/faq`, `/contact`, `/privacy`, `/track` shell, friendly 404. |
| Components | `SiteHeader`, `SiteFooter`, `CtaBand`, `ServiceCard`, `HowItWorks`, `FaqAccordion`, `ContactDetails`, plus small helpers `Icon`, `PageHero`, `SectionHeading`. |
| Libs | `db.ts` (Prisma singleton), `settings.ts` (typed settings + env fallback), `content.ts` (services/FAQs/areas queries, CSV + paragraph helpers), `statuses.ts` (allowed values and labels). |
| SEO | Title template `%s | TechMate`, settings-driven description, Open Graph, `LocalBusiness` JSON-LD on home, `sitemap.ts` (static + service URLs), `robots.ts` (allows public, disallows `/admin`), one `<h1>` per page, semantic sections. |
| Docs | `webapp/README.md`, `webapp/docs/PHASE_1.md`. |

### 8.2 Verification results

- `npm run build` ✅ 0 TypeScript errors; ESLint ✅ clean.
- All 16 public routes returned 200; unknown route returned the styled 404.
- Seed run twice → no duplicates; counts stable at 9 services / 64 areas / 8 FAQs / 8 settings / 1 admin.
- Renamed a service directly in SQLite → page showed the new name → reverted (proves DB-driven content).
- `/sitemap.xml` listed all static routes + 9 service URLs; `/robots.txt` disallowed `/admin`.
- Header/footer present on every public route; mobile menu toggles with `aria-expanded`.

### 8.3 Decisions & deviations

1. Public header/footer live in `(public)/layout.tsx` (admin shares the root layout and needs a clean shell).
2. Service detail pages use `generateStaticParams` (per spec) and are therefore SSG; admin content actions will call `revalidatePath()` so owner edits appear immediately (implemented in Phase 3).
3. Prisma pinned to 6.19.3 (npm's latest was an 8 RC).
4. npm 12 blocks install scripts unless allow-listed → `allowScripts` entries for Prisma/esbuild added to `package.json`.
5. Favicon ships as `/public/favicon.svg` (the plan's permitted fallback).
6. Extra small helpers beyond the file tree: `Icon`, `PageHero`, `SectionHeading`, `lib/content.ts`, `content/seed/types.ts`.
7. Form pages and `/track` were deliberately left as friendly placeholders until Phases 2 and 4.

**Commits:** `chore: scaffold`, `phase1: design system, seed content and full public site`.

---

## 9. Phase 2 — Detailed Record (Complete)

**Goal:** capture every lead through validated, rate-limited forms, store it in SQLite, and email both the owner and the customer — without ever failing the customer-facing flow because of email.

### 9.1 What was delivered

| Area | Detail |
|---|---|
| Validation | `src/lib/validation.ts` — zod schemas for booking, enquiry, quote, data recovery, remote support (and the `/track` reference for Phase 4). Rules match §6.2: name 2–80, email ≤120, AU-friendly phone pattern, required 10–5000 char messages, enums for delivery/time/urgency/importance/device/budget, optional preferred date (YYYY-MM-DD), optional address, booleans for "already opened?" and consent. Every message is written for a non-technical customer. Helpers `formDataToObject` and `fieldErrorsFrom`. |
| Rate limiting | `src/lib/rate-limit.ts` — the plan's exact in-memory limiter. Public actions use default 5 requests / 10 minutes per `action:IP`; IP from `x-forwarded-for` (first value) or `x-real-ip`, else `local`. |
| Email | `src/lib/email.ts` — nodemailer over Gmail SMTP. Skips with a log when `SMTP_PASS` is unconfigured; strips spaces from app passwords; recipient = `contactEmail` SiteSetting (env fallback); owner subject `[TechMate] New <kind>: <name>` with `Reply-To` = customer; friendly per-form customer acknowledgement; all sends fire-and-forget with error logging; successful sends logged. |
| Server actions | `src/lib/actions/public.ts` — `submitBooking`, `submitEnquiry`, `submitQuote`, `submitRecovery`, `submitRemoteSupport`. Each: rate limit → zod validate → extra business checks (active service slug) → Prisma create → owner + customer emails → `{ ok, message }` or `{ ok: false, fieldErrors / error }`. |
| Forms | Client components using a shared `usePublicForm` hook (single result object + pending flag): `BookingForm` (service select pre-selected from `?service=`, suburb datalist from seeded areas, delivery radio cards, native date input, time radios), `ContactForm`, `QuoteForm` (optional budget), `DataRecoveryForm` (device/importance, "already opened?", consent link to privacy, server-enforced), `RemoteSupportForm` (urgency radios). |
| Form UX | Inline field errors with `aria-invalid`/`aria-describedby`, form-level alert for rate limit/server errors, disabled "Sending…" state, friendly confirmation panel with next steps, full privacy microcopy, `noValidate` so our messages (not browser bubbles) appear. |
| Page wiring | The five placeholder panels were replaced with the real forms on `/book`, `/contact`, `/quote`, `/data-recovery`, `/remote-support`. |
| Shared controls | `FormInput`, `FormTextarea`, `FormSelect`, `FormCheckbox`, `FormRadioGroup`, `FormAlert`, `FormSuccess`, `usePublicForm`. |
| Docs | `webapp/docs/PHASE_2.md`; README Gmail app-password instructions. |

### 9.2 Verification results

- `npm run build` ✅ 0 TS errors; ESLint ✅ 0 errors / 0 warnings.
- Valid submission through **each** of the five actions → rows created in the matching SQLite tables.
- Invalid data → human, per-field messages (name, email, phone, suburb, service, delivery, preferred time, notes all exercised).
- Non-existent/inactive service slug → rejected server-side with a friendly message.
- Recovery consent unchecked → rejected server-side ("Please accept the data handling terms").
- Rate limiting → after the allowed 5 in the 10-minute window, subsequent submissions returned "Too many requests. Please wait a few minutes."
- Owner emails delivered via Gmail SMTP to `nsabharwal97@gmail.com`; customer acknowledgements sent for each form type.
- Changed `contactEmail` in SiteSettings to a plus-addressed test inbox → next submission notified the **new** address; setting reverted afterwards.
- Test rows deleted, temporary verification endpoint removed, settings restored before commit.

### 9.3 Decisions & deviations

1. Shared form controls + hook added beyond the plan's file tree (maintainability; no new dependencies).
2. No native `required` attributes — deliberate, so server-side human messages are what customers see; `aria-required` used for accessibility.
3. Email sends are fire-and-forget per the spec; if a serverless host cuts them short in Phase 5 we'll revisit awaiting the owner email.
4. Rate limiter is in-memory per process (specified) — resets on restart, single-instance only.
5. App-password whitespace stripped before SMTP auth (Gmail displays passwords in four groups).
6. `QUOTE_STATUSES` and `REMOTE_STATUSES` added to `statuses.ts` in Phase 1 to cover the schema's status columns; used by the Phase 3 tables.
7. Booking defaults: delivery = onsite; preferred time intentionally unselected so the customer chooses.

**Commits:** `phase2: lead capture forms, validation, rate limiting and email`.

---

## 10. Repository & Remote

- **Remote:** `https://github.com/Navnidhss/TechMate` (branch `main`).
- The repository root contains the planning docs (`HANDOFF.md`, `IMPLEMENTATION_PLAN.md`, `BUILD_PLAN.md`, `START_PROMPT.md`) and the app under `webapp/`.
- `webapp/.env`, `webapp/prisma/dev.db`, `node_modules`, and `.next` are git-ignored and never pushed.
- Remote history begins with the Phase 2 import commit; the detailed phase records in this file preserve what came before.

---

## 11. Phase 3 — Detailed Record (Complete)

**Goal:** give the owner a secure, no-code admin portal covering every request, a jobs module with customer tracking codes, and a content editor for services, pricing, FAQs, suburbs and settings.

### 11.1 What was delivered

| Area | Detail |
|---|---|
| Session | `lib/session.ts` keeps the spec's exact HMAC-SHA256 signed token (`uid` + 12h expiry). `lib/session-edge.ts` mirrors the same check with Web Crypto for middleware (Edge doesn't support `crypto.createHmac`). Cookie is `httpOnly`, `sameSite=lax`, `secure` in production, 12h max age. |
| Auth | `/admin/login` (generic errors, 5 attempts / 10 min per IP), first-login forced password change at `/admin/change-password` (current password verified, min 10 chars, must differ), POST-only `/admin/logout`. Middleware protects `/admin/*`; the portal layout double-checks the session and the pending password change. Every admin server action re-verifies the session. |
| Shell | Auth-gated sidebar (Dashboard, Bookings, Enquiries, Quotes, Recoveries, Remote, Jobs; Content: Services, FAQ, Areas, Settings; Change password / View website / Log out), mobile horizontal nav. |
| Dashboard | New-booking / new-enquiry / new-recovery / active-job counts and the five newest submissions across all forms, plus quick links. |
| Request tables | Shared `DataTable`: timestamp, name/contact, summary, colour badge, instant-save status dropdown (server-action validated against the allowed status list), full-details expansion. Bookings add a **Create job** button or link to the existing job. |
| Jobs | `lib/reference.ts` generates `TM-XXXXXX` codes (no I/O/0/1) with a 3-attempt uniqueness check. Create from booking → job created, booking confirmed. Jobs list has quick status changes; job detail separates **customer update** (shown on tracking + emailed, subject `[TechMate] Update on your job TM-XXXXXX`) from **private notes** (never exposed). Job update emails are fire-and-forget. |
| Content editors | Services (add/edit/hide/delete, slug fixed after creation, delete blocked when bookings exist), FAQs (CRUD + order), service areas (add/remove, grouped by zone, duplicate-safe), settings (business name, tagline, ABN, contact email, phone, hours, workshop details, AnyDesk instructions; friendly explanations). All zod-validated, with success/error banners. |
| Freshness | Every content save calls `revalidatePath()` (including `/services/[slug]`), so the statically generated service pages and all dynamic pages update immediately. |

### 11.2 Verification results

- Build and ESLint clean; all admin routes render 200 when authenticated.
- Unauthenticated `/admin`, `/admin/bookings`, `/admin/jobs` and content editors all 307 to `/admin/login?next=…`; invalid cookie rejected.
- Wrong password → generic "Incorrect username or password."; correct starter password → `/admin/change-password` (forced).
- Wrong current password and reusing the old password both rejected with field errors; a valid change logs out the old password and logs in with the new one to `/admin`.
- Status dropdowns persist (booking moved to `contacted`).
- Creating a job produced a valid `TM-8G9UUS` reference and marked the booking confirmed; job updates persisted status, customer note and private note; quick status moved the job on; two customer update emails were accepted by SMTP.
- Service edit/hide/restore worked; deleting a service with a linked booking was blocked; FAQ and area create/delete worked; settings saved (contact phone changed then restored).
- All test records were deleted and the admin password reset to the temporary seed value with the first-login change still enforced.

### 11.3 Decisions & deviations

1. Portal pages live in the `(portal)` route group so the forced password-change redirect doesn't trap `/admin/change-password`; public URLs are unchanged.
2. Edge-safe session verification (`session-edge.ts`) duplicates the HMAC logic for middleware only; both files warn to keep them in sync.
3. `session.ts` gained a `?? ""` fallback for `SESSION_SECRET` purely to satisfy TypeScript strictness.
4. Content feedback uses `?saved=` / `?error=` query params instead of client state, keeping the editors server-first.
5. Extra admin components: `AdminPageHeader`, `AdminBanner`, `CreateJobButton`, `LoginForm`, `ChangePasswordForm`.
6. Quick status changes on the jobs list email the customer their existing customer note.
7. Service slugs are immutable after creation; deletion is replaced by hiding when bookings exist.

**Commits:** `phase3: admin portal, jobs and content editors`.



---

## 12. Phase 4 — Detailed Record (Complete)

**Goal:** give customers a safe status lookup, then close out accessibility, performance and the full security checklist.

### 12.1 What was delivered

| Area | Detail |
|---|---|
| Tracking | `/track` now calls `lookupJob` (server action). Rate-limited 5/10 min per IP; reference validated (`TM-` + six characters, no I/O/0/1) and normalised to uppercase. The action selects only `reference`, `status`, `statusNote`, `updatedAt` — no customer details, no private notes. Unknown codes get one generic message. |
| Tracking UI | `TrackForm` client component: labelled input, inline errors, pending state, `aria-live` result card with status badge, customer note and last-updated timestamp, plus a privacy explanation and lost-code path. |
| Accessibility | Amber CTA reworked to dark text on amber (AA), success green darkened to `#047857` (AA), low-contrast decorative numbers adjusted, placeholders bumped to `text-muted`; disabled button styling; Escape closes the mobile menu and returns focus; `aria-current="page"` on active nav links; descriptive link text for screen readers; verified every control has a label, radio groups use fieldsets and errors are wired with `aria-describedby`/`aria-invalid`. |
| Performance | Production first-load JS remains 103 kB shared / 106 kB on content pages; forms add their own small bundle. No new dependencies or images; self-hosted fonts; CSS-only hero glow. |
| SEO | Descriptive links fix (home SEO 100); admin area sends `noindex, nofollow` from the layout as well as `robots.txt`. |

### 12.2 Verification results

- **Lighthouse 12 (production build, headless Edge):** home **98 performance / 100 accessibility / 100 best-practices / 100 SEO**; service detail page **98 performance / 100 accessibility**; `/track` **100 accessibility**.
- **Tracking:** valid code returns status/customer note/time; response keys are exactly the four allowed fields; lowercase input normalises; malformed and unknown codes produce friendly generic errors; the 6th lookup in the window is rate-limited.
- **Build / lint:** `npm run build` clean, ESLint clean.
- **Security checklist:** all §11 items pass — public actions rate-limited and validated, bcrypt + forced password change, signed HttpOnly/SameSite/Secure cookie, `/admin` doubly protected, generic login and tracking failures, parameterised Prisma only, no committed secrets, consent enforced, all admin actions re-verify the session, admin pages noindexed.
- Test job and automated test data removed. One manually entered booking/job (TM-EQKSZA) from the owner's own trial remains in the database and was deliberately left untouched.

### 12.3 Decisions & deviations

1. Lighthouse was run locally via `npx lighthouse` driving headless Edge — not added as a project dependency. Scores should be re-checked on the final host in Phase 5.
2. Amber CTA colour treatment changed to dark-on-amber to meet WCAG AA; the darker hover keeps white text at ≈5:1.
3. The rate limiter remains in-memory/per-process (per spec) — a restart clears the window.
4. `/track` echoes the reference itself (needed so the customer can confirm what they searched) but nothing else.

**Commits:** `phase4: customer tracking, accessibility and security pass`.

---

## 13. Phase 4.5 — Detailed Record (Complete, local-only verified)

**Goal:** real appointment slots on `/book`, auto-synced two-way with the owner's Google Calendar, cancellations both ways, with zero new dependencies.

### 13.1 What was delivered

| Area | Detail |
|---|---|
| Schema | `Service.durationMinutes` (migration sets 90/60/30 per service) + `Appointment`, `ScheduleBlock`, `CalendarConnection`, `CalendarCache`. Appointment stores reference, customer details, start/end, status, `cancelledBy`, `googleEventId`, unique `cancelToken`. |
| Settings | `schedDays`, `schedStart`, `schedEnd`, `schedHorizonDays`, `schedNoticeHours`, `schedBufferMinutes`, `schedPolicyNote` — seeded, modelled, zod-validated and editable in admin with friendly labels. |
| Engine | `time.ts` (Perth UTC+8 helpers), `schedule.ts` (`getBusy` with 5-minute cache, Google sync, deletion reconciliation, cached fallback on Google errors; `computeAvailableSlots` with working days, blocks, 30-min grid, per-service duration, notice, buffer, horizon, 40-slot cap). |
| Public booking | `getSlots` (30/10min), `bookAppointment` (5/10min; slot re-checked inside a transaction; Google event created after commit and persisted; owner + customer emails), `cancelAppointment` (10/10min; timing-safe token; customer-only when `booked`; event deleted; both parties emailed). Five-step `BookingScheduler` at `/book`; request form preserved at `/book/request`; token-gated `/cancel/[reference]` showing only service/delivery/time/reference. |
| Google | Dependency-free `google.ts` (OAuth URL/exchange/refresh, paginated event list incl. all-day, create/delete), `google-auth.ts` (auto-refresh within 60s, null in local-only mode), AES-256-GCM `crypto.ts`, OAuth routes with 10-minute state cookie at `/admin/calendar/connect` + `/admin/calendar/callback`, encrypted token storage, cache clearing on connect/disconnect. |
| Admin | `/admin/appointments` (upcoming first, full details, sync indicator, cancel with confirm), `/admin/calendar` (connection status, sync now, disconnect, day/partial blocks CRUD, setup guidance, limitation note), dashboard “Appointments (7 days)” card, service duration field, scheduling settings section. All actions guarded by shared `requireAdmin()`. |
| Emails | Owner new-booking, customer confirmation (with cancel link + policy), cancellation notices (other party + customer copy), sync-removed owner notice. |
| Docs | `docs/PHASE_4_5.md`, `docs/CALENDAR_SETUP.md`, CONTENT_GUIDE (sections 4/7/8/11), README (features, env vars, docs). |

### 13.2 Verification results

- **Local-only (Google absent):** slots per duration; buffer removes neighbouring slots; duplicate bookings rejected; **two simultaneous bookings → exactly one winner** with “time was just taken”; notice/horizon/blocks/Sunday enforced; bookings persist with `TM-XXXXXX`; confirmation/cancellation emails sent; cancel page leaks no name/email/phone; wrong token generic; cancel frees the slot; replay rejected; `/book/request` still creates BookingRequests.
- **Admin:** cancel (status/cancelledBy/email), block add/delete, duration save/restore, scheduling settings save/restore, force sync, all pages 200.
- **Google graceful states:** not configured (“Local availability only” + setup text, Connect short-circuits); configured-not-connected (dummy env) shows Connect and redirects to Google with the right `redirect_uri`; callback with a wrong `state` is rejected before token exchange.
- **Quality:** 390px CDP sweep of 9 public routes → `innerWidth = scrollWidth = 390` (no overflow); Lighthouse `/book` **98 performance / 100 accessibility / 100 SEO**; build + ESLint clean.
- **Pending owner setup:** real connect, booking→Google event, Google events blocking slots, delete-in-Google reconciliation (items 7–10 of the phase checklist). Steps in `docs/CALENDAR_SETUP.md` §7.

### 13.3 Decisions & deviations

1. Google libs were written in Step 2 because the slot engine depends on them; admin/OAuth UI followed in Step 3.
2. `requireAdmin()` moved to `lib/admin-auth.ts` so calendar admin actions share the identical guard (no behaviour change).
3. Added a customer cancellation confirmation email (spec's “other party” email alone didn't cover “emails both parties”).
4. OAuth connect/callback are route handlers (no admin chrome), same URLs, still middleware-protected.
5. Onsite bookings require an address; horizon is re-checked inside `bookAppointment` as defence in depth.
6. `GOOGLE_CALENDAR_ID` env respected, default `primary`.
7. Documented correction: Google expires refresh tokens after ~7 days while the OAuth app is in “Testing”; the guide recommends publishing the app (unverified is fine for owner-only use).
8. Time-moves in Google are not followed (documented): cancel & rebook.
9. `NEXT_PUBLIC_SITE_URL` added to `.env.example` (closes verifier F1). F2 (`SESSION_SECRET` fail-fast) stays on the Phase 5 checklist.
10. Admin appointment sync indicator shown in the table's status slot (status badge is already shown in the row title area).

---

## 14. Next Step

1. **Owner:** complete `webapp/docs/CALENDAR_SETUP.md` (Google Cloud project, enable Calendar API, consent screen published, OAuth client with the correct redirect URI, `.env` credentials, Connect), then run the four checks in §7. Report results so the two-way items can be marked verified.
2. **Phase 5 — Deployment** (hosting, SQLite → hosted Postgres/Turso, domain/DNS, production `NEXT_PUBLIC_SITE_URL` and Google redirect URI, plus verifier F2: fail fast on missing `SESSION_SECRET`). **Do not start without explicit owner authorisation.** Write `docs/DEPLOYMENT.md` first.
