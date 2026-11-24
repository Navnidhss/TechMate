# Phase 4 — Tracking, Polish & Security Pass

**Status:** Complete (full build; deployment remains Phase 5 and has not been started)
**Date:** Session 6

---

## What Was Built / Changed

### Customer job tracking (`/track`)
- `lookupJob` server action: rate-limited (5 / 10 min per IP), validates the reference with `trackReferenceSchema` (uppercases input, `TM-` + six characters excluding I/O/0/1).
- Returns **only** `reference`, `status`, `statusNote` and `updatedAt`. Names, emails, phone numbers, suburbs and private admin notes are never queried for the response.
- Failed lookups use one generic message ("We couldn't find that reference…") — no way to confirm whether a code exists.
- `TrackForm` client component: labelled input (`autoCapitalize`, `spellCheck` off), inline field errors, pending state, generic error alert, and an `aria-live` status card with a status badge, the customer note and "last updated" time.
- Page copy explains that tracking shows only the status and latest update, with a "lost your code?" path to contact.

### Accessibility pass
- Contrast fixes measured against WCAG AA:
  - Amber CTA now uses dark ink text on amber (was white on amber ≈ 2.1:1); hover uses the darker amber with white (≈ 5.0:1).
  - Success green darkened from `#059669` to `#047857` so success text passes AA (≈ 5.5:1 on white).
  - Low-contrast decorative numerals and the 404 number now use accessible tones.
  - Input placeholders use `text-muted` (≈ 4.6:1) instead of a 70% tint.
- Disabled buttons now show a clear disabled state (opacity + not-allowed cursor).
- Mobile menu: `aria-expanded`/`aria-controls`, Escape closes it and returns focus to the toggle button.
- Active navigation links expose `aria-current="page"` (site header + admin sidebar).
- Verified every input, select, textarea and checkbox has a programmatically associated label; radio groups use `<fieldset>`/`<legend>`; errors are linked via `aria-describedby` and `aria-invalid`.
- Accordion is native `<details>`/`<summary>` (full keyboard support, no JS).
- Global `:focus-visible` outline retained; skip-to-content link present; `<html lang="en-AU">`.
- Desktop-card links now have descriptive accessible text (screen-reader suffixes) so audit tools see "Learn more about …" rather than six identical "Learn more" links.

### Performance
- Production build first-load JS: 103 kB shared; public content pages carry only the header/nav client bundle (106 kB total), form pages add their form bundle.
- No new images or libraries; fonts self-hosted via `next/font`; hero glow is pure CSS.
- Service detail pages remain statically generated and are refreshed by admin `revalidatePath()`.

### SEO
- Descriptive link text fixed (home Lighthouse SEO 100).
- Admin area now sends `noindex, nofollow` at the layout level in addition to `robots.txt` disallowing `/admin`.

## Verification Results

### Lighthouse (production build, `next start`, Lighthouse 12, headless Edge)

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` (home) | **98** | **100** | **100** | **100** |
| `/services/computer-repair` | **98** | **100** | — | — |
| `/track` | — | **100** | — | — |

Plan target was ≥ 90 performance and accessibility on home — exceeded.

### Tracking & data-leak checks

| Check | Result |
|---|---|
| Valid reference returns the job | ✅ Correct status + customer note + last update |
| Response keys | ✅ Exactly `reference`, `status`, `statusNote`, `updatedAt` — no PII, no `adminNote` |
| Lowercase input | ✅ Normalised (`tm-abcdef` → `TM-ABCDEF`) |
| Malformed reference | ✅ Friendly validation message |
| Unknown reference | ✅ Generic "couldn't find that reference" (no existence oracle) |
| Rate limiting | ✅ 5 lookups allowed, 6th → "Too many requests. Please wait a few minutes." |

### Security checklist (plan §11)

| Item | Status |
|---|---|
| Every public server action rate-limited + zod-validated server-side | ✅ all six (booking, enquiry, quote, recovery, remote, track) |
| Admin password bcrypt-hashed; first-login change forced | ✅ bcrypt cost 10; seed flag still `true`; layout + login enforce the change |
| Session cookie httpOnly, HMAC-signed, 12h expiry, SameSite=Lax, Secure in production | ✅ verified in `login` and `logout` |
| `/admin/*` unreachable without a session (middleware + layout + actions) | ✅ 307 redirects for all routes; every action calls `requireAdmin()` |
| Login rate-limited, generic failures, no user enumeration | ✅ 5 / 10 min; identical error for unknown user/wrong password |
| `/track` leaks nothing beyond status + note; failed lookup non-committal | ✅ proven above |
| Prisma parameterised everywhere (no raw SQL) | ✅ no `queryRaw` / `executeRaw` anywhere |
| `.env` git-ignored; `.env.example` complete; no secrets committed | ✅ only `.env.example` tracked; Gmail app password never committed |
| Data-recovery consent enforced server-side | ✅ zod refine rejects unchecked consent |
| Admin actions re-verify the session | ✅ `requireAdmin()` on all actions except login itself |
| CSRF | ✅ Next.js Server Actions validate Origin/Host; session cookie is SameSite=Lax and HttpOnly |
| Admin pages not indexed | ✅ `robots.txt` disallow + `noindex, nofollow` metadata |

### Other checks
- `npm run build` ✅ 0 errors; `npx eslint src prisma` ✅ clean.
- All public routes and admin routes still render; 404 page unchanged in behaviour.
- The test job created for tracking verification was deleted. One manually entered booking and job (TM-EQKSZA) from the owner's own trial remain in the database and were deliberately left in place.

## Deviations / Notes

1. **Lighthouse** was run locally against a production build using headless Microsoft Edge via `CHROME_PATH` (Lighthouse 12 via `npx`, not added to project dependencies). Scores are local-machine results; re-run on the final host in Phase 5.
2. **Rate limiting** remains in-memory/per-process (specified for v1), so a restart clears the window.
3. **`/track`** deliberately reveals the reference code itself (echoed back) plus status/note/time; nothing else.
4. **Tracking page is intentionally not linked to a public sitemap priority** beyond the existing `/track` entry — the page is meant for customers with a code, but is harmless and indexable.
5. Accessibility contrast changes slightly alter the amber button style (dark text instead of white) — a deliberate WCAG AA trade-off.

## Open Questions

None blocking. Owner still to supply: final business name, domain, AnyDesk ID copy, ABN (tracked in `HANDOFF.md` §4). Deployment (Phase 5) awaits explicit owner authorisation.
