# TechMate — web app

Website + admin portal for **TechMate**, a solo at-home IT service covering the Perth metro, WA.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Prisma 6 + SQLite, zod, and nodemailer.
Enquiry-only in v1 — no payments, no shop. The admin portal is the CMS.

---

## Prerequisites

- **Node.js 20+** (developed on Node 24)
- **npm** (the repo is set up for npm; `package-lock.json` is committed)
- Nothing else — SQLite needs no server.

> **npm 12 note:** newer npm versions block package install scripts unless they are allow-listed.
> `package.json` already contains the required `allowScripts` entries for Prisma and esbuild, so
> `npm install` works out of the box. If a future dependency needs a build script, approve it with
> `npm install-scripts approve <package>` and commit the updated `package.json`.

---

## First-time setup

```bash
cd webapp
npm install

# Create your local environment file from the template
cp .env.example .env

# Generate a real session secret (64 hex characters) and paste it into .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Create the SQLite database and tables
npx prisma migrate dev

# Load starter content (services, FAQs, suburbs, settings, admin user)
npm run db:seed

# Start the dev server
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma client, then build for production |
| `npm start` | Run the production build |
| `npm run db:migrate` | Create/apply a Prisma migration |
| `npm run db:seed` | Seed starter content (safe to re-run — never duplicates or overwrites edits) |
| `npm run lint` | Run ESLint |

---

## Environment variables

All variables live in `.env` (git-ignored). `.env.example` documents every one.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) |
| `SESSION_SECRET` | HMAC secret for admin session cookies — must be long and random |
| `SMTP_HOST` | Gmail SMTP host (`smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587`) |
| `SMTP_USER` | Gmail address used to send notifications |
| `SMTP_PASS` | Gmail **app password** (not the normal account password) |
| `OWNER_EMAIL_FALLBACK` | Where enquiries go if the `contactEmail` setting is empty |
| `NEXT_PUBLIC_SITE_URL` | *(optional)* Public URL used in the sitemap — defaults to `http://localhost:3000` |

### Gmail app password (for enquiry emails)

1. Google Account → **Security** → turn on **2-Step Verification**.
2. Security → **App passwords** → create one for "Mail".
3. Paste the 16-character password into `SMTP_PASS` in `.env`.

Until this is set, form submissions are still saved to the database; email sending is skipped
gracefully and logged, so nothing breaks.

---

## Admin portal

The portal lives at `/admin` (login at `/admin/login`). A starter administrator is created by the seed:

- **Username:** `admin`
- **Password:** `TechMateAdmin2025!`

The first login forces a password change (minimum 10 characters, must differ). Sessions are signed,
HTTP-only cookies valid for 12 hours; login attempts are rate-limited. Change the username/password
before any real use, and never commit credentials.

What's in the portal:

- **Dashboard** — counts of new bookings, enquiries and recoveries, active jobs, and the latest five
  submissions.
- **Bookings / Enquiries / Quotes / Recoveries / Remote** — every request with full details and an
  instant-save status dropdown.
- **Jobs** — turn a booking into a tracked job with a `TM-XXXXXX` reference code. Customer update
  notes are shown on the tracking page and emailed to the customer; private notes stay internal.
- **Content** — services & prices, FAQs, service areas, and site settings (including the contact email
  that receives all enquiry notifications). Changes appear on the public site immediately.

A non-technical owner's guide lives at [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).

---

## Content editing

All business content is stored in the database and edited at `/admin/content/*` (services, FAQs,
service areas, settings such as the contact email). The files in `src/content/seed/` are only the
**initial** content — they are used once, by `npm run db:seed`, and never overwrite edits afterwards.

`src/content/seed/` is still the place to change the *defaults* for a brand-new install.

---

## Project structure

```
webapp/
├── prisma/            schema, migrations, seed script
├── public/            logo, logo mark, favicon
├── src/
│   ├── app/
│   │   ├── (public)/  customer-facing pages (shared header/footer layout)
│   │   ├── admin/     login-protected admin portal
│   │   ├── layout.tsx root layout, fonts, metadata
│   │   ├── sitemap.ts robots.ts not-found.tsx
│   ├── components/    shared UI (header, footer, cards, forms, admin widgets)
│   ├── content/seed/  starter content — single source of truth for the seed
│   └── lib/           db, settings, validation, email, auth, rate limiting, helpers
├── docs/              phase documentation + owner content guide
└── .env.example
```

---

## Database

- SQLite database file: `prisma/dev.db` (git-ignored).
- Inspect data visually: `npx prisma studio`.
- Reset everything (destructive): `npx prisma migrate reset` then `npm run db:seed`.

---

## Documentation

- `docs/PHASE_1.md` … `docs/PHASE_4.md` — what was built in each phase, verification results, deviations.
- `docs/CONTENT_GUIDE.md` — the owner's no-code content editing guide.
- `../HANDOFF.md` — project status, decisions and session log (project root).
- `../IMPLEMENTATION_PLAN.md` — the authoritative specification (project root).

---

## Deployment

Not yet configured — deployment and domain purchase are deliberately deferred. Local development
and production builds work today; hosting notes will be added in `docs/DEPLOYMENT.md` when the
owner is ready.
