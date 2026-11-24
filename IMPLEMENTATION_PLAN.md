# IMPLEMENTATION_PLAN.md — TechMate Web App

> **AUTHORITATIVE CODE-LEVEL SPEC.** This document is the single source of truth for implementation. The implementing engineer (DeepSeek v4.1 Flash or any other) must follow it exactly. If anything here conflicts with a model's own preferences, **this document wins**. Background reading: `HANDOFF.md` (owner decisions + status) and `BUILD_PLAN.md` (high-level plan) — both in this same folder.

---

## PART 0 — MISSION & GROUND RULES

### 0.1 Mission (condensed)

Build **TechMate** — a website + admin portal for a solo at-home IT services business covering the **whole Perth metro, Western Australia**. Placeholder business name: TechMate. Non-tech-savvy customers must find it friendly and plain-English. The owner must be able to edit all content (services, prices, FAQs, suburbs, contact email, AnyDesk info) through the admin dashboard without touching code. **No online payments, no shop in v1.** Enquiries go to the owner's email + database. Building locally only (no domain, no deployment yet).

### 0.2 Non-negotiables (violating any of these = failed phase)

1. **Maintainability** — exact folder structure below, small focused components, no duplicated logic, consistent naming, TypeScript `strict` with **zero `any`**.
2. **Content editability** — NO business content hard-coded in pages. Services, prices, FAQs, suburbs, contact details all come from the database (seeded from `src/content/seed/`), editable via admin UI. The only allowed hard-coded strings are navigation labels, UI microcopy (button text etc.), and legal page bodies.
3. **Security** — server-side zod validation on every form, rate limiting on every public form action, bcrypt password hashing, signed HTTP-only cookies for admin sessions, secrets only in `.env`, no client-trusted data.
4. **Documentation** — update `HANDOFF.md` (same repo root's parent folder — see §0.5) after every work session; write `docs/PHASE_X.md` after each phase; keep `README.md` accurate.

### 0.3 Rules of engagement for the implementing engineer

- **Follow the spec.** Do not redesign, rename, restructure, or invent features. Copy this document's details exactly.
- **Work step-by-step in the given order.** Verify each step (build/dev-server/manual checks) before moving to the next.
- **When a requirement is genuinely ambiguous:** choose the default documented here; if no default exists, implement the simplest reasonable option, and **log it** in the phase's `docs/PHASE_X.md` under "Deviations & open questions". Never silently change a non-negotiable.
- **When blocked/conflicting spec:** STOP that step, note the question under HANDOFF.md §4 "Open questions", continue with other steps if possible.
- **Only these dependencies** may be added: the exact list in §2.2. Nothing else without a documented reason.
- **Never commit secrets.** `.env` is git-ignored; `.env.example` documents every variable.
- All customer-facing copy: **Australian English**, AUD with `$`, friendly plain-English tone, no jargon (explain tech terms). GST wording: "All prices include GST." is fine for placeholder copy.
- **After completing each phase:** (a) run the full phase verification checklist (§9), (b) update HANDOFF.md session log + current status, (c) write `docs/PHASE_X.md`, (d) STOP and report to the owner before starting the next phase.

### 0.4 Project location

- Project root: `C:\Users\Nav\Documents\TechMate` (already exists, with a Desktop shortcut).
- **All application code goes in `C:\Users\Nav\Documents\TechMate\webapp\`** (you create this folder).
- HANDOFF.md and BUILD_PLAN.md live in the project root (`C:\Users\Nav\Documents\TechMate\`), NOT inside `webapp\`. Your phase docs go in `webapp\docs\`.

### 0.5 Target file structure (create exactly this)

```
TechMate/                        # project root (exists)
├── HANDOFF.md                   # exists — update, do not move
├── BUILD_PLAN.md                # exists — read-only for you
├── IMPLEMENTATION_PLAN.md       # exists — this spec
├── START_PROMPT.md              # exists — the kickoff prompt
└── webapp/                      # YOU CREATE THIS — everything below is yours
    ├── .env                     # local secrets (git-ignored)
    ├── .env.example             # documents every secret var
    ├── .gitignore               # node_modules, .env, dev.db, .next
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json           # strict: true
    ├── postcss.config.mjs
    ├── prisma/
    │   ├── schema.prisma       # §4 exactly
    │   ├── migrations/         # via prisma migrate dev
    │   └── seed.ts             # reads src/content/seed/*, idempotent upserts
    ├── public/
    │   ├── logo.svg            # §3.4 exact SVG
    │   ├── logo-mark.svg       # badge only (favicon-size)
    │   └── favicon.ico         # generated from logo-mark colours
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # fonts, header, footer, metadata
    │   │   ├── globals.css     # Tailwind 4 @theme tokens (§3.2)
    │   │   ├── sitemap.ts
    │   │   ├── robots.ts
    │   │   ├── not-found.tsx
    │   │   ├── (public)/
    │   │   │   ├── page.tsx                # Home
    │   │   │   ├── about/page.tsx
    │   │   │   ├── contact/page.tsx        # + contact server action
    │   │   │   ├── faq/page.tsx
    │   │   │   ├── pricing/page.tsx
    │   │   │   ├── service-areas/page.tsx
    │   │   │   ├── services/page.tsx
    │   │   │   ├── services/[slug]/page.tsx
    │   │   │   ├── book/page.tsx           # + booking server action
    │   │   │   ├── data-recovery/page.tsx  # + intake server action
    │   │   │   ├── remote-support/page.tsx # + remote request server action
    │   │   │   ├── quote/page.tsx          # + quote server action
    │   │   │   ├── track/page.tsx          # + lookup server action
    │   │   │   └── privacy/page.tsx
    │   │   └── admin/
    │   │       ├── login/page.tsx
    │   │       ├── logout/route.ts         # POST → clears cookie, redirect
    │   │       ├── change-password/page.tsx
    │   │       ├── layout.tsx              # auth-gated shell w/ sidebar
    │   │       ├── page.tsx                # dashboard overview
    │   │       ├── bookings/page.tsx
    │   │       ├── enquiries/page.tsx
    │   │       ├── quotes/page.tsx
    │   │       ├── recoveries/page.tsx
    │   │       ├── remote/page.tsx
    │   │       ├── jobs/page.tsx           # + jobs/[id]/page.tsx
    │   │       └── content/
    │   │           ├── services/page.tsx   # list + new + edit forms
    │   │           ├── faq/page.tsx
    │   │           ├── areas/page.tsx
    │   │           └── settings/page.tsx
    │   ├── components/
    │   │   ├── SiteHeader.tsx
    │   │   ├── SiteFooter.tsx
    │   │   ├── CtaBand.tsx            # reusable "Book now" band
    │   │   ├── ServiceCard.tsx
    │   │   ├── HowItWorks.tsx
    │   │   ├── FaqAccordion.tsx       # <details> based, no JS dependency
    │   │   ├── ContactDetails.tsx    # renders from SiteSettings
    │   │   ├── forms/BookingForm.tsx
    │   │   ├── forms/ContactForm.tsx
    │   │   ├── forms/DataRecoveryForm.tsx
    │   │   ├── forms/QuoteForm.tsx
    │   │   ├── forms/RemoteSupportForm.tsx
    │   │   ├── forms/TrackForm.tsx
    │   │   ├── admin/Sidebar.tsx
    │   │   ├── admin/DataTable.tsx    # generic table w/ status dropdown
    │   │   ├── admin/StatusBadge.tsx
    │   │   └── admin/SubmitButton.tsx # useFormStatus pending state
    │   ├── lib/
    │   │   ├── db.ts                 # Prisma singleton client
    │   │   ├── settings.ts            # getSettings() w/ typed keys, env fallback
    │   │   ├── validation.ts         # ALL zod schemas (§6.2)
    │   │   ├── email.ts              # nodemailer + templates (§6.4)
    │   │   ├── session.ts            # signed-cookie admin session (§7.2 — use EXACT code)
    │   │   ├── rate-limit.ts         # in-memory limiter (§6.3 — use EXACT code)
    │   │   ├── reference.ts          # job reference codes (§7.4)
    │   │   ├── statuses.ts           # allowed status constants
    │   │   └── actions/public.ts     # public server actions (book/contact/etc.)
    │   │   └── actions/admin.ts     # admin server actions (CRUD, status updates)
    │   ├── content/seed/             # initial content — single source of truth
    │   │   ├── services.ts           # §5.1 — copy below
    │   │   ├── faqs.ts               # §5.3
    │   │   ├── areas.ts              # §5.2
    │   │   └── settings.ts          # §5.4 defaults
    │   └── middleware.ts             # protects /admin/* (§7.2)
    ├── README.md                    # setup + run + build instructions
    └── docs/
        ├── PHASE_1.md … PHASE_4.md   # written as phases complete
        └── CONTENT_GUIDE.md          # owner's no-code content editing guide (Phase 3)
```

---

## PART 1 — ENVIRONMENT & SCAFFOLD

### 1.1 Preconditions

- Node.js ≥ 20, npm ≥ 10. Verify: `node -v`. If missing, tell the owner to install Node 20 LTS before continuing.

### 1.2 Scaffold (Phase 1, Step 1)

```powershell
cd C:\Users\Nav\Documents\TechMate
mkdir webapp
cd webapp
# Create Next.js app non-interactively in this folder:
npx --yes create-next-app@15 . --typescript --tailwind --eslint --app --no-src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```

Note: `create-next-app` creates `src/` structure when `--src-dir` is used; if the exact flag set differs by version, ensure the outcome is: **TypeScript + ESLint + Tailwind + App Router + `src/` directory + import alias `@/*`**. If the flag names have changed in your Next version, adapt flags but keep that outcome.

### 1.3 Exact dependency additions (after scaffold)

```powershell
npm install prisma @prisma/client zod bcryptjs nodemailer
npm install --save-dev @types/bcryptjs @types/nodemailer
```

**No other packages.** Do not add UI kits, auth libraries, animation libraries, or state libraries. Everything else is hand-rolled per this spec.

### 1.4 Config files

- `tsconfig.json`: ensure `"strict": true`.
- `.gitignore` must include: `node_modules/`, `.next/`, `.env`, `*.db` (covers `dev.db`), `prisma/migrations/dev.db`.
- `package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "postinstall": "prisma generate"
}
```

(`tsx` is bundled with modern Next templates; if not present: `npm install --save-dev tsx`.)

- `.env.example` — create with EXACTLY these keys:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="CHANGE_ME_generate_64_hex_chars"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="nsabharwal97@gmail.com"
SMTP_PASS="your_gmail_app_password_here"
OWNER_EMAIL_FALLBACK="nsabharwal97@gmail.com"
```

- `.env` — copy of `.env.example` with a real `SESSION_SECRET` (generate 64 hex chars) and the rest left as placeholders (owner supplies the Gmail app password later; email sending must fail gracefully — see §6.4).
- Git: `git init` inside `webapp/` (or confirm create-next-app did), make the first commit "chore: scaffold".

### 1.5 Prisma setup

```powershell
npx prisma init --datasource-provider sqlite
```

Then replace `prisma/schema.prisma` content with §4 and run:

```powershell
npx prisma migrate dev --name init
npm run db:seed
```

---

## PART 2 — TECH STACK (locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS 4 (CSS-first `@theme` config in `globals.css`) |
| DB | SQLite via Prisma 6 (`file:./dev.db`) |
| Validation | zod (schemas shared client/server) |
| Auth | Custom: bcryptjs + HMAC-signed cookie session (exact code in §7.2) |
| Email | nodemailer over Gmail SMTP (app password) |
| Forms | React Server Components + Server Actions (`"use server"`) |
| Icons | Inline SVG only (no icon packages) |

**SQLite gotchas:** no enums (use `String` + status constants in `lib/statuses.ts`), no arrays (store CSV strings like `"onsite,remote"` and split in code).

---

## PART 3 — DESIGN SYSTEM

### 3.1 Tone of design

Modern, warm, trustworthy, **slightly unique** — not a cookie-cutter corporate template. Friendly rounded cards, generous whitespace, plain-English microcopy ("Tell us what's going wrong", not "Submit query"). Aim: a nervous non-technical customer should feel reassured, not intimidated.

### 3.2 Design tokens — `globals.css` (Tailwind 4 `@theme`)

```css
@import "tailwindcss";

@theme {
  --color-primary: #0f766e;        /* deep teal */
  --color-primary-dark: #115e59;
  --color-primary-light: #14b8a6;
  --color-accent: #f59e0b;          /* warm amber */
  --color-accent-dark: #b45309;
  --color-ink: #1e293b;            /* headings */
  --color-body: #475569;           /* body text */
  --color-muted: #64748b;
  --color-surface: #f8fafc;         /* page background */
  --color-card: #ffffff;
  --color-line: #e2e8f0;
  --color-success: #059669;
  --color-danger: #dc2626;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-sora), var(--font-inter), ui-sans-serif, sans-serif;
}
```

Conventions:
- Headings use `font-display` (Sora), bold, `text-ink`.
- Cards: `bg-card rounded-2xl border border-line shadow-sm`.
- Primary buttons: `bg-primary text-white hover:bg-primary-dark rounded-xl px-6 py-3 font-semibold`.
- Accent (book-now CTA only): `bg-accent text-white hover:bg-accent-dark`.
- Section spacing: `py-16`; container `max-w-6xl mx-auto px-4`.
- Unique flourishes (subtle, consistent): a thin amber underline bar under every section heading; hero background = `surface` with a large soft radial teal glow (pure CSS, no images); rounded "pill" badges for delivery options (Onsite / Remote / Workshop).

### 3.3 Fonts — in `src/app/layout.tsx`

```ts
import { Inter, Sora } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-sora" });
```

(If the build machine is offline and `next/font/google` fails, fall back to `system-ui` stack and note it in docs.)

### 3.4 Logo — `public/logo.svg` (use this exact SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="TechMate">
  <rect width="96" height="96" rx="20" fill="#0f766e"/>
  <!-- laptop screen -->
  <rect x="22" y="24" width="52" height="34" rx="6" fill="none" stroke="#ffffff" stroke-width="5"/>
  <!-- amber check on screen -->
  <path d="M38 42 l7 7 l16 -16" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- laptop base -->
  <rect x="16" y="64" width="64" height="7" rx="3.5" fill="#ffffff"/>
  <rect x="40" y="60" width="16" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
</svg>
```

`logo-mark.svg`: same file without the `aria-label` change needed — just reuse. Wordmark next to badge: "Tech" in `font-display text-ink` + "Mate" in `font-display text-primary`. Favicon: recolour-free conversion of `logo-mark.svg` to `favicon.ico` (any standard converter; if unavailable, ship `favicon.svg` and reference it in metadata).

---

## PART 4 — DATABASE SCHEMA (Prisma — exact)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model SiteSetting {
  key   String @id          // e.g. "contactEmail"
  value String
}

model Service {
  id          Int     @id @default(autoincrement())
  slug        String  @unique
  name        String
  shortDesc   String              // card summary, <= 140 chars
  description String              // detail page body, plain paragraphs (\n\n separated)
  delivery    String              // CSV of: onsite, remote, workshop
  priceFrom   String?             // e.g. "From $89" — free text, customer-facing
  priceNotes  String?            // e.g. "Free quote before any work begins."
  icon        String?            // key into a small built-in icon map in code
  sortOrder   Int     @default(0)
  active      Boolean @default(true)
}

model Faq {
  id        Int    @id @default(autoincrement())
  question  String
  answer    String
  sortOrder Int    @default(0)
}

model ServiceArea {
  id        Int    @id @default(autoincrement())
  zone      String             // e.g. "Northern Suburbs"
  suburb    String
  sortOrder Int    @default(0)

  @@unique([zone, suburb])
}

model BookingRequest {
  id             Int      @id @default(autoincrement())
  name           String
  email          String
  phone          String
  suburb         String
  serviceSlug    String
  delivery       String              // onsite | remote | workshop
  preferredDate  String?             // YYYY-MM-DD, optional
  preferredTime  String              // morning | afternoon | evening | flexible
  address        String?
  notes          String
  status         String   @default("new")
  createdAt      DateTime @default(now())

  job            Job?
}

model Enquiry {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model QuoteRequest {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  phone     String
  details   String
  budget    String?
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model DataRecoveryIntake {
  id           Int      @id @default(autoincrement())
  name         String
  email        String
  phone        String
  deviceType   String              // desktop / laptop / external drive / phone / other
  deviceMake   String?
  importance   String              // critical | important | nice-to-have
  symptoms     String
  tampered     Boolean              // "already opened / attempted recovery?"
  consent      Boolean              // accepted data-handling terms
  status       String   @default("new")
  createdAt    DateTime @default(now())
}

model RemoteSupportRequest {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  phone     String
  issue     String
  urgency   String              // asap | today | this-week
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model Job {
  id             Int      @id @default(autoincrement())
  reference      String   @unique            // TM-XXXXXX, see §7.4
  customerName   String
  customerEmail  String
  customerPhone  String?
  suburb         String?
  serviceSummary String
  status         String   @default("received") // see lib/statuses.ts
  statusNote     String                        // CUSTOMER-VISIBLE note
  adminNote      String                        // internal only
  bookingId      Int?      @unique
  booking        BookingRequest? @relation(fields: [bookingId], references: [id])
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model AdminUser {
  id                 Int      @id @default(autoincrement())
  username           String   @unique
  passwordHash       String
  mustChangePassword Boolean  @default(true)
  createdAt          DateTime @default(now())
}
```

`src/lib/statuses.ts` — the ONLY allowed status values (validate against these everywhere):

```ts
export const BOOKING_STATUSES   = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export const ENQUIRY_STATUSES   = ["new", "contacted", "closed"] as const;
export const RECOVERY_STATUSES  = ["new", "assessing", "quoted", "in-progress", "recovered", "unrecoverable", "closed"] as const;
export const JOB_STATUSES      = ["received", "in-progress", "awaiting-parts", "awaiting-customer", "completed", "cancelled"] as const;
export const DELIVERY_OPTIONS  = ["onsite", "remote", "workshop"] as const;
export const TIME_OPTIONS      = ["morning", "afternoon", "evening", "flexible"] as const;
export const URGENCY_OPTIONS   = ["asap", "today", "this-week"] as const;
export const IMPORTANCE_OPTIONS = ["critical", "important", "nice-to-have"] as const;
export const DEVICE_TYPES       = ["desktop-pc", "laptop", "external-drive", "usb-stick", "phone", "other"] as const;
```

---

## PART 5 — SEED CONTENT (single source of truth: `src/content/seed/`)

Seed script is **idempotent**: upsert by unique key (slug / zone+suburb / key / question text). Running `npm run db:seed` twice must not duplicate.

### 5.1 `seed/services.ts` — use this content (edit later via admin)

| # | slug | name | shortDesc | delivery | priceFrom | sortOrder |
|---|---|---|---|---|---|---|
| 1 | computer-repair | Computer & Laptop Repair | Slow, broken, or behaving strangely — PCs, laptops and Macs repaired at your home, our workshop, or remotely. | onsite,remote,workshop | From $89 | 1 |
| 2 | virus-removal | Virus & Malware Removal | Suspect a virus? We'll clean your device, remove the nasties, and set you up so it doesn't happen again. | onsite,remote,workshop | From $99 | 2 |
| 3 | data-recovery | Data Recovery | Photos, documents, precious files — if it's recoverable, we'll get it back. Free assessment and honest advice. | workshop | Free assessment | 3 |
| 4 | it-support | IT Support & Troubleshooting | Friendly, plain-English help with whatever's gone wrong — no question too small, no jargon, no judgement. | onsite,remote | $79 per hour | 4 |
| 5 | managed-it | Small Business Managed IT | Keep your small business running smoothly with ongoing IT care, security and support on a simple monthly plan. | onsite,remote | From $99 per month | 5 |
| 6 | new-setup | New PC & Device Setup | New computer, phone or tablet? We'll set it up properly, transfer your files and show you how it all works. | onsite,remote | From $99 | 6 |
| 7 | networking | NBN, Wi-Fi & Home Networking | Patchy Wi-Fi, confusing modems or dead zones — we'll get your whole home online and fast. | onsite | From $109 | 7 |
| 8 | smart-devices | Phone, Tablet & Smart Home Help | Printers, smart TVs, streaming, smart speakers and everything in between — set up right and explained simply. | onsite,remote | From $79 | 8 |
| 9 | sourcing | Hardware & Software Sales | Need a new laptop, part or software licence? Tell us what you do and we'll source the right one at a fair price. | remote | Quoted per order | 9 |

For each service's `description` (detail page body), write 3 short plain-English paragraphs in this voice: what it covers → how it works (visit / remote / drop-off) → reassurance + fixed-quote promise. Do not invent extra services.

`priceNotes` for all services: `"We give you a fixed quote before any work begins — no surprises."` (except data-recovery: `"Free assessment. If we can't recover your data, there's no recovery fee."` and managed-it: `"Month-to-month plans — no lock-in contracts."`)

### 5.2 `seed/areas.ts` — zones & suburbs (whole Perth metro)

- **Perth CBD & Inner**: Perth CBD, Northbridge, West Perth, East Perth, Subiaco, Leederville, Nedlands, Claremont
- **Northern Suburbs**: Joondalup, Wanneroo, Hillarys, Warwick, Kingsley, Mindarie, Currambine, Carramar
- **North-Eastern Suburbs**: Morley, Bassendean, Ballajura, Noranda, Dianella, Maylands, Bayswater
- **Eastern Suburbs**: Midland, Ellenbrook, Forrestfield, Kalamunda, Mundaring, Belmont, Guildford
- **Western Suburbs**: Cottesloe, Fremantle, Mosman Park, Scarborough, Trigg, Osborne Park
- **Southern Suburbs**: Fremantle, Melville, Kardinya, Willagee, Booragoon, Applecross, South Perth, Como
- **South-Eastern Suburbs**: Cannington, Canning Vale, Bentley, Victoria Park, Thornlie, Gosnells, Maddington
- **South-Western Suburbs**: Success, Cockburn Central, Kwinana, Rockingham, Safety Bay, Baldivis, Secret Harbour
- **Peel & Outer**: Mandurah, Pinjarra, Serpentine, Byford, Armadale, Kelmscott

### 5.3 `seed/faqs.ts` — write these 8 Q&As in plain friendly English

1. **Do you charge a call-out fee?** No call-out fee for bookings within the Perth metro — we'll always confirm the details and give you a fixed quote before any work starts.
2. **What areas do you cover?** The whole Perth metro area, from Joondalup to Mandurah and the coast to the hills. If you're a bit further out, just ask — we'll let you know honestly if we can help.
3. **How does remote support work?** It's easier than it sounds. You download a small program called AnyDesk from the official site, read us the 9-digit number on your screen, and we can see what you see — with your permission — and fix it while you watch. You're in control the whole time.
4. **Is my personal data safe?** Absolutely. Your privacy is taken seriously — we only access what's needed for the job, never browse your personal files for fun, and data recovered for you is handled carefully and returned or securely deleted. See our privacy page for details.
5. **What if you can't fix it?** Then you don't pay for the fix. We'll be upfront about what's wrong, what it would cost, and whether it's even worth repairing — sometimes the honest answer is "time for a new one", and we'll tell you that.
6. **Do you sell computers and parts?** Yes — we can source quality laptops, parts and software licences for you. Tell us what you use your computer for and your budget, and we'll find the right fit rather than the biggest price tag.
7. **How soon can you come out?** Often same or next business day for urgent jobs across the metro. For remote support, we can usually connect with you the same day.
8. **Do you help with Macs and Apple devices?** Yes — MacBooks, iMacs, iPhones and iPads are all part of a day's work.

### 5.4 `seed/settings.ts` — default SiteSetting values

```
contactEmail     = nsabharwal97@gmail.com     ← NOTE: also make this the .env OWNER_EMAIL_FALLBACK; settings value wins at runtime
contactPhone     = 0400 000 000               (placeholder, owner updates in admin)
businessName     = TechMate
tagline          = Friendly IT help that comes to you — Perth metro
tradingHours     = Monday–Saturday 8am–6pm · Sunday by appointment
anydeskInfo      = Download AnyDesk from anydesk.com, then send us your 9-digit ID and we'll connect.
workshopAddress  = Drop-off available across Perth metro — address confirmed when you book.
abn              = (empty string — placeholder until owner supplies)
```

### 5.5 Seed admin user

`prisma/seed.ts` also upserts one AdminUser: `username: "admin"`, `passwordHash: bcrypt("TechMateAdmin2025!")`, `mustChangePassword: true`. Document these temporary credentials in README (owner changes on first login — forced).

---

## PART 6 — FORMS, VALIDATION, RATE LIMITING, EMAIL (Phase 2 spec)

### 6.1 Form architecture

- Every form is a client component rendering `<form action={serverAction}>`.
- Server Actions live in `src/lib/actions/public.ts` (`"use server"` at top of file).
- Pattern per action:
  1. `rateLimit(actionKey, ip)` → too many → return `{ ok: false, error: "Too many requests. Please wait a few minutes." }`
  2. `schema.safeParse(formData)` → collect field errors into a `Record<string, string>`
  3. On success: `prisma.<Model>.create(...)`, then fire-and-forget email (§6.4), return `{ ok: true }`
  4. On validation failure: return `{ ok: false, fieldErrors }` — forms render field errors inline. **No `useFormState` complexity beyond a simple `useState` result object.**
- Success state: replace the form with a friendly confirmation panel ("Thanks Jen! We've got your booking request and will confirm by email — usually the same day.") + note that an email copy is on its way.

### 6.2 Zod schemas — `src/lib/validation.ts` (exact field rules)

Common: `name`: 2–80 chars required. `email`: valid email, max 120. `phone`: required, regex `/^[0-9 ()+.-]{8,20}$/`. `notes/details/issue/symptoms/message`: required, 10–5000 chars. Suburb: required max 60. Every field gets a human message like `"Please tell us your name"` — no terse "invalid" errors.

- **BookingRequest**: name, email, phone, suburb, serviceSlug (must match an active Service slug — validate against DB), delivery (enum), preferredDate optional (`/^\d{4}-\d{2}-\d{2}$/`), preferredTime (enum), address optional max 200, notes.
- **Enquiry**: name, email, phone optional, subject (5–120), message.
- **QuoteRequest**: name, email, phone, details, budget optional (enum: under-500 / 500-1000 / 1000-2000 / not-sure).
- **DataRecoveryIntake**: name, email, phone, deviceType (enum), deviceMake optional, importance (enum), symptoms, tampered (bool), consent (`refine(v => v === true, "Please accept the data handling terms")`).
- **RemoteSupportRequest**: name, email, phone, issue, urgency (enum).
- **Job lookup**: reference regex `/^TM-[A-HJKMNP-Z2-9]{6}$/` (note: exclude I, O, 0, 1 to avoid confusion).

### 6.3 Rate limiter — `src/lib/rate-limit.ts` (use EXACT code)

```ts
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Allow `limit` requests per `windowMs` per key. Returns false when blocked. */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
```

Key format: `"<action>:<ip>"` — get IP from headers (`x-forwarded-for` first value, else `"local"`). Document limitation: in-memory per-process; fine for v1 single-instance, revisit if deployed multi-instance.

### 6.4 Email — `src/lib/email.ts`

- Create transporter from env: host `SMTP_HOST`, port `SMTP_PORT` (587), auth `SMTP_USER`/`SMTP_PASS`. If `SMTP_PASS` is still the placeholder value, **skip sending entirely and log "email not configured"** — never crash the form flow.
- Recipient: the `contactEmail` SiteSetting (fallback: `OWNER_EMAIL_FALLBACK`). This is how the owner changes their email later without touching code.
- `sendOwnerNotification(kind, data)`: subject `[TechMate] New ${kind}: ${name}`, body = plain-text key/value dump of the submission + reply-to header set to the customer's email.
- `sendCustomerAcknowledgement(kind, to, name)`: short friendly "we got your request, we'll reply usually same day" email. Send fire-and-forget (`void p.catch(err => console.error)`) — never block or fail the user-facing action on email errors.
- `sendOwnerNotification` kinds: booking, enquiry, quote, recovery, remote-support. Job status changes (Phase 3) also email the customer the new `statusNote` if `customerEmail` exists — include the job reference in the subject: `[TechMate] Update on your job TM-ABC123`.

---

## PART 7 — AUTH, ADMIN PORTAL, JOBS (Phase 3 spec)

### 7.1 Admin pages shell

`/admin/*` (except `/admin/login`) renders inside an auth-gated layout: top-left logo + wordmark "TechMate Admin", left sidebar (Dashboard, Bookings, Enquiries, Quotes, Recoveries, Remote, Jobs, then "Content" section: Services, FAQ, Areas, Settings; bottom: Change password, Log out). Mobile: sidebar collapses to a horizontal scroll nav. Admin pages use the same tokens but no marketing flourishes — dense, functional.

### 7.2 Session — `src/lib/session.ts` (use EXACT code)

```ts
import crypto from "crypto";
const COOKIE_NAME = "tm_admin_session";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payload: string): string {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET)
    .update(payload).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): number | null {
  if (!token?.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (sig !== sign(payload)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: number; exp: number };
    if (data.exp < Date.now()) return null;
    return data.uid;
  } catch { return null; }
}

export { COOKIE_NAME };
```

`src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();
  const uid = verifySessionToken(req.cookies.get(COOKIE_NAME)?.value);
  if (uid === null) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
```

Login action: find user by username, `bcrypt.compare`, on success set cookie (`httpOnly; sameSite=lax; secure in production; maxAge 12h; path=/`), rate-limit `login:ip` at 5/10min, generic error message "Incorrect username or password." On first login with `mustChangePassword`, redirect to `/admin/change-password` which enforces a new password (min 10 chars, must differ) and clears the flag. Logout = POST route clearing cookie.

### 7.3 Admin data pages (bookings, enquiries, quotes, recoveries, remote)

All built on one generic pattern:
- `DataTable` props: columns, rows, statusList, plus per-row expand → detail view.
- Each row: timestamp, name, contact info, summary snippet, **status dropdown** (instant-save server action), and for bookings a **"Create job"** button → creates Job from booking (§7.4), links `bookingId`, marks booking `confirmed`.
- Jobs page: list with reference, customer, status dropdown, link to `/admin/jobs/[id]` for editing `statusNote` (customer-visible) vs `adminNote` (internal) with clear labels distinguishing them.
- Dashboard `/admin`: count cards (new bookings, new enquiries, new recoveries, active jobs) + 5 most recent items across types with links.

### 7.4 Job reference codes — `src/lib/reference.ts`

```ts
import crypto from "crypto";
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
export function newJobReference(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `TM-${code}`;
}
```

Check uniqueness against DB in a retry loop (max 3 attempts, then error).

### 7.5 Content editor pages (`/admin/content/*`)

The heart of the "content editability" non-negotiable:
- **Services**: sortable list (sortOrder), toggle active, inline edit form (name, shortDesc, description textarea, delivery checkboxes, priceFrom, priceNotes, icon) — uses zod schemas; deleting a service requires confirmation and only allowed if no bookings reference its slug (else show "deactivate instead").
- **FAQ**: simple CRUD with sortOrder.
- **Areas**: CRUD grouped by zone.
- **Settings**: one form with all SiteSettings keys — **especially contactEmail, contactPhone, tradingHours, anydeskInfo, workshopAddress, abn** — each labelled with a friendly explanation ("This is where all your enquiry emails are sent.").

Every content editor action writes a short audit trail line to a `docs/content-log.md` appendix? No — keep it simple: log to console + no history needed in v1. **Do not build versioning.** (Owner backup = git + DB file.)

---

## PART 8 — PAGES SPEC (public)

All public pages render from DB (services, faqs, areas, settings) via server components — no client fetching. Layout: `SiteHeader` (logo + wordmark, nav: Services, Pricing, Areas, FAQ, About, Contact; prominent amber **"Book now"** button) + `SiteFooter` (settings-rendered contact details, quick links, ABN line if set, small print).

| Page | Sections |
|---|---|
| `/` Home | Hero (headline: "Friendly IT help that comes to you." sub: "Computer repairs, IT support and more — at your home, remotely, or at our workshop. Everywhere in Perth.") + delivery pills (Onsite/Remote/Workshop) + CTA · trust strip ("Fixed quotes before work begins", "No fix, no fee", "Same-day remote help") · top-6 service cards · How it works (1 Tell us the problem → 2 We visit, or connect remotely → 3 It's fixed, explained plainly) · data-recovery highlight band · FAQ teaser (first 4) · CTA band |
| `/services` | All active services as cards, grouped nothing fancy — grid; each links to detail + "Book this" |
| `/services/[slug]` | `generateStaticParams` from DB; hero w/ name + priceFrom · description paragraphs · "How it works for you" delivery-specific steps · priceNotes callout · FAQ subset (pick 4 relevant, else first 4) · amber CTA "Book this service" (→ `/book?service=slug`) · 404 for unknown slug |
| `/pricing` | Table: service name / priceFrom / priceNotes · honesty section: fixed quotes, no fix-no fee, GST wording, call-out-free metro |
| `/service-areas` | Intro "We cover the whole Perth metro" + zones with suburb pill badges · note: "Not listed? If you're near Perth, just ask." |
| `/data-recovery` | Reassuring hero ("Losing files is horrible. Let's see what we can get back.") · 3-step process (bring/send it in → free assessment → honest quote) · "no data, no fee" callout · intake form |
| `/remote-support` | AnyDesk explained simply (3 steps, includes settings-rendered anydeskInfo) · "What we can fix remotely" bullets · request form (urgency) |
| `/quote` | Quote request form + "what happens next" steps |
| `/about` | Short friendly story (drafted placeholder: solo local tech, years of experience, loves making tech simple for people) · values cards: Plain English, Honest advice, On time, Patient |
| `/faq` | All FAQs, accordion |
| `/contact` | `ContactDetails` (settings-rendered) · contact form · "Prefer to book? → /book" |
| `/book` | The main booking form; `?service=slug` query pre-selects service · delivery radio (onsite/remote/workshop w/ plain-English blurbs) · preferred date/time pickers (native `<input type="date">`, radio for time-of-day — NOT a calendar widget) · suburb text input with datalist of seeded suburbs |
| `/track` | "Where's my repair?" single input for reference code → status card (status badge, statusNote, lastUpdated) · "Lost your code? Contact us" link. **Security: only expose status + statusNote — never emails, phone numbers or admin notes.** Failed lookup shows generic "We couldn't find that reference." (no existence oracle) |
| `/privacy` | Plain-English placeholder privacy policy (what data we collect via forms, why, Gmail/email handling, no selling data, contact email for questions). Mark it clearly as template text pending final review. |
| 404 | Friendly "This page seems to have wandered off. Let's get you back on track." + link home |

---

## PART 9 — SEO SPEC

- `metadata` in root layout: title template `%s | TechMate`, description from settings tagline, openGraph basics, icons.
- `sitemap.ts`: static routes + all active service slugs.
- `robots.ts`: allow all, disallow `/admin`, sitemap link.
- JSON-LD on home: `LocalBusiness` (`@type: "LocalBusiness"`, name from settings, email, phone, areaServed: "Perth Metropolitan Area, WA, Australia", addressLocality: "Perth").
- Each service page: unique title (`{service.name} in Perth — TechMate`), meta description from shortDesc.
- Semantic HTML: one `<h1>` per page, real headings order, `alt` on images, `aria-label` on icon-only links.

---

## PART 10 — PHASE EXECUTION ORDER & VERIFICATION

### Phase 1 — Foundation & core site
1. Scaffold (§1.2–1.4) → verify: `npm run dev` shows default page.
2. Prisma schema + migrate + seed (§4, §5) → verify: `npx prisma studio` shows seeded rows.
3. Design system + logo + layout/header/footer (§3) → verify: styled home placeholder.
4. Home page + components (§8) → verify manual render.
5. Services index + detail + pricing + areas + about + faq + contact + privacy (§8) → verify each route renders seeded content.
6. SEO (§9) → verify `/sitemap.xml`, `/robots.txt`.
7. **Verification checklist:** `npm run build` passes with zero TS errors; every §8 route returns 200 with content from DB (temporarily edit a seeded service name → see it change on page); header/footer on all pages; mobile menu works; write `docs/PHASE_1.md`; update HANDOFF.md; **STOP — report to owner.**

### Phase 2 — Lead capture
1. `validation.ts` (§6.2) + `rate-limit.ts` (§6.3) + `email.ts` (§6.4).
2. Booking form + action + customer/owner emails; then contact, quote, data-recovery, remote-support forms (same pattern).
3. `.env` SMTP note to owner (they must generate a Gmail app password: Google Account → Security → 2-Step Verification → App passwords).
4. **Verification:** submit each form once with valid data → row in DB (prisma studio); with invalid data → inline human errors; 6 rapid submissions → rate-limit message; change `contactEmail` setting → new submission notifies new address (with SMTP configured); build passes; docs + HANDOFF update; **STOP.**

### Phase 3 — Admin portal
1. `session.ts` + middleware + login/logout/change-password (§7.2) → verify unauthenticated `/admin` redirects to login.
2. Admin layout + dashboard + the five data tables with status updates (§7.3).
3. Jobs module: create from booking, reference codes, status notes (§7.4) + customer update emails.
4. Content editors: services, FAQ, areas, settings (§7.5) → this unlocks the owner's content-editability promise.
5. **Verification:** login works; wrong password shows generic error; first-login forces password change; each table updates status without page errors; content edits reflect instantly on public pages; unauthenticated access to every `/admin/*` URL redirects; **docs/PHASE_3.md + docs/CONTENT_GUIDE.md (owner guide, non-technical)**; HANDOFF update; **STOP.**

### Phase 4 — Tracking + polish + security pass
1. `/track` lookup (§8) with security rules.
2. Accessibility pass: labels on every input, focus rings, contrast check on tokens, keyboard nav for menu/accordion.
3. Performance: check build output, add `next/image` only if actual images were added (logo is inline SVG), otherwise ensure no client JS on pure-content pages beyond header menu.
4. Security checklist run (§0.2 item 3 + §11) — record results in `docs/PHASE_4.md`.
5. **Verification:** `/track` shows seeded job status; no status data leak; Lighthouse (Chrome devtools) ≥ 90 performance & accessibility on home; full build clean; docs + HANDOFF; **STOP.**

### Phase 5 — Deployment — **DO NOT START until the owner explicitly says so** (domain purchase is an owner decision). When started: follow `docs/DEPLOYMENT.md` written at that time (Vercel free tier, hosted Postgres/Turso migration for SQLite limitation, Gmail SMTP app password, domain DNS).

---

## PART 11 — FINAL SECURITY CHECKLIST (must all be true at phase 4 end)

- [ ] Every public server action: rate-limited + zod-validated server-side
- [ ] Admin password bcrypt-hashed; first-login change forced
- [ ] Session cookie: httpOnly, signed (HMAC), 12h expiry, SameSite=Lax, Secure in prod
- [ ] `/admin/*` unreachable without session (middleware + layout double-check)
- [ ] Login rate-limited; generic failure messages; no user enumeration
- [ ] `/track` leaks nothing beyond status + note; failed lookup is non-committal
- [ ] Prisma parameterised everywhere (no raw string SQL)
- [ ] `.env` git-ignored; `.env.example` complete; no secrets anywhere in committed files
- [ ] Data-recovery consent checkbox enforced server-side
- [ ] All admin server actions re-verify session (actions callable only via authenticated UI routes)

---

## PART 12 — CODING STANDARDS (all phases)

- TypeScript strict; **no `any`**; zod `.infer` for form value types.
- Server components by default; client components only for interactive bits (forms with state, header menu, accordion is `<details>` so it's server-safe).
- One export per component file; props typed with explicit interfaces.
- Naming: components `PascalCase.tsx`, libs `camelCase.ts`, routes lowercase.
- Comments: brief "why" comments on non-obvious logic (rate limiting, session, reference codes), none on obvious code.
- Commit message convention: `phase1: <what>`, `phase2: <what>` — small commits as steps complete.
- Every page's data fetch uses a small dedicated function in the page file or `lib/` — no sprawling inline Prisma chains.
- Australian English in ALL copy: "organise", "kilometre", "favourite". Currency: `$89`, `$99 per month`. No US spelling anywhere.
