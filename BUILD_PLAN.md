# BUILD_PLAN.md — TechMate (Perth At-Home IT Services Web App)

> Reference plan. **Status tracking lives in HANDOFF.md, not here.** Owner decisions are recorded in HANDOFF.md §2.

---

## 1. What We're Building

A customer-facing website + admin portal for **TechMate**, a solo at-home IT services business covering the Perth metro area (Western Australia). Site must be friendly to non-tech-savvy visitors, modern and slightly unique in design, SEO-strong for local searches, and fully editable by a non-developer owner.

### Services (v1 content)

| Service | Delivery |
|---|---|
| Computer repair (PC/laptop/Mac) | Onsite, workshop (drop-off), remote |
| General IT support & troubleshooting | Onsite, remote |
| Virus & malware removal | Onsite, remote, workshop |
| Data recovery | Workshop/mail-in intake |
| Virus removal | Onsite / remote |
| Small business managed IT | Onsite + remote plans |
| New PC setup, NBN/Wi-Fi/network help | Onsite |
| Phone, tablet & smart-home help | Onsite, remote |
| Hardware & software sales | **No shop in v1** — "Ask us to source it" enquire flow instead |

### Core Feature Set (v1 — confirmed by owner)

1. **Brochure site** — home, services, pricing, service areas, about, FAQ, contact.
2. **Booking requests** — customer picks service + preferred day/time; no live calendar (solo operator confirms by email/phone).
3. **Intake & quote forms** — data recovery intake, general quote request, remote-support request (AnyDesk).
4. **Customer status lookup** — lightweight: customer enters job reference → sees status notes (no full accounts in v1).
5. **Admin portal** — login-protected dashboard: view/manage bookings, enquiries, quotes, data-recovery intakes; update job statuses (which feeds the customer status lookup); **edit site content** (services, pricing, FAQs, suburbs, contact email) without touching code.
6. **Enquiries emailed** to `nsabharwal97@gmail.com` (config value, easy to change) + stored in database.
7. **SEO** — local/suburb pages, structured data, sitemap, GBP-ready.
8. **Payments: none in v1** (enquiry only). Shop + online payments = future phase.

---

## 2. Tech Stack (free / lowest-cost, per owner's decision)

| Layer | Choice | Why (cost) |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Free, one codebase for site + admin, easy local dev |
| Styling | **Tailwind CSS** | Fast, consistent design system |
| Database | **SQLite** (via Prisma) | Free, zero-dependency on cloud; can migrate to Postgres free tier later |
| Email | **Nodemailer via Gmail SMTP** (app password in `.env`) | Free; email address is a config value |
| Auth (admin) | Custom credentials + bcrypt + signed HTTP-only session cookie | Free, no third-party needed |
| CMS | **Built-in admin content editor** (content stored in DB/seeded JSON, editable via admin UI) | Free; owner-editable without any external CMS service |
| Hosting (later) | Vercel free tier (+ Turso/Neon free DB when SQLite won't travel) | £0 to start |
| Version control | Git from day one | Free, safety net |

**Rationale:** owner chose "lowest cost / free, free tiers, local build first." SQLite keeps everything on-disk with no accounts needed; the only external dependency is Gmail SMTP, which uses the existing email.

---

## 3. Architecture Overview

```
webapp/
├── src/
│   ├── app/
│   │   ├── (public)/            # home, services, pricing, areas, about, faq, contact
│   │   │   ├── book/            # booking request wizard
│   │   │   ├── data-recovery/   # intake form
│   │   │   ├── remote-support/  # AnyDesk request flow
│   │   │   ├── track/           # customer job-status lookup
│   │   │   └── api/             # server actions / route handlers (forms, validation, rate limiting)
│   │   └── admin/                # login-gated dashboard
│   │       ├── (dashboard)/     # bookings, enquiries, quotes, recoveries
│   │       ├── content/         # content editor (services, pricing, FAQ, suburbs, settings incl. contact email)
│   │       └── auth/             # login, logout, password change
│   ├── components/              # reusable UI (forms, cards, nav, footer)
│   ├── lib/                     # db client, auth, email, validation, rate-limit helpers
│   └── content/                 # SEED content files (single source of truth to re-seed)
├── prisma/                      # schema + migrations
├── public/                      # logo, icons, images
├── docs/                        # all project documentation
└── .env.example                 # documents every required secret (no real secrets committed)
```

**Key architectural rules (the non-negotiables made concrete):**

- **Content editability:** every piece of owner-editable text (service descriptions, prices, FAQ, suburb list, contact email, phone, hours, AnyDesk info) is a database record or setting edited through the admin UI. Pages render from data, never hardcode copy.
- **Maintainability:** TypeScript strict, small focused components, all business config in one place, consistent file naming, comments where logic isn't obvious.
- **Security:** server-side validation on every form (zod), rate limiting on public endpoints, bcrypt-hashed admin password, HTTP-only/SameSite signed session cookies, secrets only in `.env`, no client-trusted prices or statuses, admin routes middleware-protected, CSRF-safe server actions.
- **Documentation:** `/docs/` gains a page per phase; README covers setup; HANDOFF.md updated every session.

---

## 4. Data Model (draft)

- `SiteSettings` — key/value (contact email, phone, hours, AnyDesk ID, business name…)
- `Service` — name, slug, description, pricing notes, delivery options, order, active
- `PricingTier` / `PriceGuide` — plain-language price ranges per service
- `Faq` — question, answer, order
- `ServiceArea` — suburb/metro zone list (drives service-area page + SEO)
- `BookingRequest` — name, contact, service, preferred date/time, address/suburb, issue notes, status
- `Enquiry` (general) & `QuoteRequest`
- `DataRecoveryIntake` — device type, damage, data priority, consent, status
- `Job` — a tracked job with public reference code, status, status notes (feeds customer "Track my repair" lookup)
- `AdminUser` — hashed credentials, single owner to start

---

## 5. Pages & Routes (v1)

**Public:** `/` · `/services` + per-service pages (`/services/[slug]`) · `/pricing` · `/service-areas` (+ suburb SEO content) · `/data-recovery` · `/remote-support` · `/about` · `/faq` · `/contact` · `/book` · `/track` (job status) · legal pages (privacy)

**Admin:** `/admin/login` · `/admin` (dashboard overview) · `/admin/bookings` · `/admin/enquiries` · `/admin/recoveries` · `/admin/jobs` · `/admin/content` (services, pricing, FAQ, areas, settings)

---

## 6. Phases & Milestones

> Order chosen so something useful exists as early as possible, and each phase is independently shippable.

### Phase 1 — Foundation & Core Site
- Next.js + TS + Tailwind scaffold, Git init, strict linting
- Design system: colour palette (trustworthy blue/teal + one distinctive accent), typography, buttons, cards; placeholder **TechMate logo** (SVG)
- Database schema + Prisma + seed content (all placeholder copy drafted)
- Pages: Home, Services (+detail), Pricing, Service Areas, About, FAQ, Contact, Privacy
- SEO: metadata, sitemap, robots, LocalBusiness JSON-LD
- **Milestone: full site browsable locally with real (placeholder) content**

### Phase 2 — Lead Capture (forms + email + storage)
- Booking request form (service → preferred time → details)
- Data recovery intake, quote request, remote-support request, general contact
- Server-side validation + rate limiting; Nodemailer → Gmail; all submissions persisted
- Owner notification emails with enquiry summaries
- **Milestone: every enquiry arrives in inbox + database**

### Phase 3 — Admin Portal
- Admin auth (credentials, hashed, session cookies, login rate-limit)
- Dashboard: bookings / enquiries / recoveries / quotes tables with statuses
- **Jobs module:** create job from a booking, update status + customer-visible notes → generates reference code
- **Content editor:** edit services, pricing, FAQ, suburbs, and Site Settings (contact email, phone, hours, AnyDesk info) — all without code
- **Milestone: owner runs the whole business from the dashboard, edits all site content themselves**

### Phase 4 — Customer Tracking & Polish
- `/track` — customer enters reference code → status + notes
- Accessibility + mobile polish pass, performance pass (Lighthouse)
- Security review checklist; documentation finalisation (README, docs/*, content-editing guide for owner)
- **Milestone: v1 feature-complete, security-reviewed, documented**

### Phase 5 — Deploy (when owner ready)
- Domain purchase guidance; Vercel free tier; migrate SQLite → free hosted Postgres/Turso; Gmail SMTP app-password setup; HTTPS, analytics (free), Google Business Profile hookup
- **Milestone: live on a real domain at £0/month**

### Future phases (out of scope for v1, parked)
- Shop: product catalog + cart + Stripe/Afterpay payments
- Multi-staff scheduling with live calendar availability
- Customer accounts with login history
- Automated review requests after job completion

---

## 7. Security Checklist (applies across all phases)

- [ ] All form input validated server-side (zod schemas shared with client for UX)
- [ ] Rate limiting on all public form endpoints
- [ ] Admin password bcrypt-hashed; no plaintext anywhere
- [ ] Session cookies HTTP-only, Secure (in prod), SameSite=Lax, signed
- [ ] Admin routes behind auth middleware — no unprotected admin page/API
- [ ] Secrets only in `.env` (never committed); `.env.example` documents them
- [ ] No SQL via string concat (Prisma parameterised)
- [ ] Public job tracking exposes only status + notes tied to a random non-guessable reference code
- [ ] CSP + security headers; dependency audit in CI/lint script
- [ ] Admin UI reachable only via login; generic error messages on failed login

## 8. Documentation Plan

| Doc | Purpose |
|---|---|
| `README.md` | One-command setup, overview |
| `docs/PHASE_1.md` … | What each phase built, key decisions |
| `docs/CONTENT_GUIDE.md` | Owner's guide: editing content/pricing/email via admin UI |
| `docs/DEPLOYMENT.md` | Phase 5: going live on free hosting |
| `HANDOFF.md` | Always-current session/phase status (maintained separately from this plan) |
