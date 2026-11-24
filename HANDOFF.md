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

- **Phase:** 2 complete — all five lead-capture forms, server-side validation, rate limiting and email delivery are live and verified. **Phase 3 (admin portal) not started — awaiting owner go-ahead.**
- **Last updated:** Session 4 (implementation session 2)
- **What's done:**
  - **Phase 1:** `webapp/` scaffolded (Next.js 15, TypeScript strict, Tailwind 4, App Router, `src/`); Prisma schema + migration + SQLite `dev.db`; idempotent seed (9 services, 8 FAQs, 64 suburbs, 8 settings, starter admin `admin` / `TechMateAdmin2025!`); design system + logo; full public site (home, services + 9 detail pages, pricing, areas, about, FAQ, contact, privacy, 404); SEO (metadata, JSON-LD, sitemap, robots); `docs/PHASE_1.md`
  - **Phase 2:** `validation.ts` (all zod schemas + human messages), exact `rate-limit.ts` (5 per 10 min per action+IP), `email.ts` (Gmail SMTP, owner notification + customer acknowledgement, graceful skip if unconfigured), five public server actions, five forms with inline errors/pending/success states, shared form controls. Owner notification recipient comes from the editable `contactEmail` setting. `docs/PHASE_2.md`
  - Gmail SMTP verified working with the owner's app password (stored only in git-ignored `.env`)
  - Build + ESLint clean; all forms tested end-to-end with real DB writes and real emails; rate limit, invalid input, consent enforcement and `contactEmail` setting change all verified
- **What's NOT done:**
  - Phase 3 admin portal (login, dashboard, data tables, jobs module, content editors) — `/admin/*` does not exist yet
  - Phase 4 `/track` lookup + accessibility/security polish
  - Phase 5 deployment — off-limits until the owner authorises it
- **Blockers / open questions:**
  - [ ] Final business name (TechMate is placeholder)
  - [ ] Domain purchase (deferred until ready to deploy)
  - [ ] AnyDesk ID / remote-support details for the site copy
  - [ ] ABN (must be displayed on an AU business site once available)
  - [ ] Owner sign-off to start Phase 3

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
| `Documents/TechMate/webapp/` | The application code |
| `Documents/TechMate/webapp/README.md` | Setup, run, env vars, structure |
| `Documents/TechMate/webapp/docs/PHASE_1.md` | Phase 1 report: what was built, verification, deviations |
| `Documents/TechMate/webapp/docs/PHASE_2.md` | Phase 2 report: forms, validation, rate limiting, email |

---

## 7. Session Log

| Date | Phase | Summary |
|---|---|---|
| Kickoff | 0 | Questions asked, all decisions recorded, project directory + Desktop shortcut created, handoff + build plan written. Awaiting go-ahead to begin Phase 1 scaffold. |
| Session 2 | 0 | Created `IMPLEMENTATION_PLAN.md` (full code-level spec: stack, folder structure, Prisma schema, seed content, form/validation/email/auth specs, phase-by-phase verification checklists) and `START_PROMPT.md` (kickoff prompt with reading order, working rules, reporting format). Project ready to hand to the implementing model. |
| Session 3 | 1 | **Phase 1 complete.** Scaffolded Next.js 15 app in `webapp/`, configured Prisma 6 + SQLite, wrote and ran the idempotent seed (9 services, 8 FAQs, 64 suburbs, 8 settings, admin user), built the design system (teal/amber tokens, Sora + Inter), logo assets, public layout (header/footer), and all public pages incl. 9 service detail pages, pricing, areas, about, FAQ, contact, privacy and friendly 404. Added SEO (metadata, JSON-LD, sitemap, robots) and `docs/PHASE_1.md`. Verified: build + ESLint clean, every route 200, content proven to come from the DB. Form pages and `/track` are friendly placeholders until Phases 2 & 4. Awaiting go-ahead for Phase 2. |
| Session 4 | 2 | **Phase 2 complete.** Added `validation.ts` (all zod schemas, human error messages), exact `rate-limit.ts`, `email.ts` (Gmail SMTP owner notification + customer acknowledgement, graceful skip when unconfigured) and five public server actions. Built all five forms (booking with service pre-select, suburb datalist and delivery/time radios; contact; quote; data recovery with enforced consent; remote support) plus shared form controls, inline field errors, pending and success states. Owner supplied a Gmail app password; SMTP verified. Verified end-to-end: real DB rows, real emails, invalid-input messages, rate limiting at 5/10 min, consent enforcement, and `contactEmail` setting change routing notifications to the new address. `docs/PHASE_2.md` written; build + ESLint clean. Awaiting go-ahead for Phase 3 (admin portal). |

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

