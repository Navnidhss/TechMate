# Phase 1 — Foundation & Core Site

**Status:** Complete (awaiting owner review before Phase 2)
**Date:** Session 1

---

## What Was Built

- Next.js 15 project scaffolded in `webapp/` — TypeScript (strict), ESLint, Tailwind CSS 4, App Router, `src/` directory, `@/*` import alias.
- Locked dependencies installed: `prisma` + `@prisma/client` 6.19.3, `zod`, `bcryptjs`, `nodemailer`, plus dev types and `tsx` for seeding.
- `.env` / `.env.example` created with all spec'd variables; a real 64-hex `SESSION_SECRET` generated for local dev.
- Prisma schema implemented exactly per spec (11 models), `init` migration applied, SQLite `dev.db` created.
- Idempotent seed script with all 9 services (3-paragraph plain-English descriptions), 8 FAQs, 64 suburbs across 9 zones, 8 site settings, and the starter admin user.
- Design system in `globals.css` using Tailwind 4 `@theme` tokens (teal/amber/ink palette, Sora + Inter fonts, card/button/pill/field utilities, hero glow, amber heading bar).
- Logo assets: `public/logo.svg`, `public/logo-mark.svg`, `public/favicon.svg` (referenced from metadata).
- Public layout: sticky header with mobile menu, phone link and amber "Book now"; footer with DB-driven service links, contact details, ABN line and small print.
- Public pages: home, services index, service detail (dynamic route), pricing, service areas, about, FAQ, contact, privacy, book, quote, data-recovery, remote-support, track, plus a friendly 404.
- Shared components: `Icon` (inline SVG set), `PageHero`, `SectionHeading`, `ServiceCard`, `HowItWorks`, `FaqAccordion`, `CtaBand`, `ContactDetails`.
- SEO: metadata templates, per-page titles/descriptions, Open Graph, LocalBusiness JSON-LD on home, `sitemap.ts` (static + service routes), `robots.ts` (disallows `/admin`), semantic headings and skip link.
- README with setup, scripts, env vars, Gmail app-password instructions and project structure.

## Key Files

| Path | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema (exact spec) |
| `prisma/seed.ts` | Idempotent seed (create-if-missing) |
| `src/content/seed/*.ts` | Initial services, FAQs, areas, settings |
| `src/lib/db.ts` | Prisma singleton |
| `src/lib/settings.ts` | Typed settings loader with env fallback |
| `src/lib/content.ts` | Read helpers + CSV/paragraph parsing |
| `src/lib/statuses.ts` | Allowed status/option constants + labels |
| `src/app/globals.css` | Design tokens and shared component classes |
| `src/app/(public)/layout.tsx` | Public header/footer shell |
| `src/app/(public)/page.tsx` | Home page |
| `src/components/*` | Reusable site components |

## Verification Results

| Check | Result |
|---|---|
| `npm run build` | ✅ Passes — 0 TypeScript errors, 0 ESLint errors (1 warning fixed during the pass) |
| `npx eslint src prisma` | ✅ Clean |
| All §8 routes return 200 | ✅ `/`, `/services`, `/services/computer-repair`, `/pricing`, `/service-areas`, `/about`, `/faq`, `/contact`, `/privacy`, `/book`, `/quote`, `/data-recovery`, `/remote-support`, `/track`, `/robots.txt`, `/sitemap.xml` |
| Unknown route returns 404 | ✅ `/does-not-exist` → 404 with friendly page |
| Seed idempotency | ✅ Ran twice: still 9 services, 64 areas, 8 FAQs, 8 settings, 1 admin |
| Content comes from DB | ✅ Renamed a service in SQLite → new name appeared on the page → reverted |
| Sitemap | ✅ Lists all static routes + 9 service URLs |
| Robots | ✅ `Allow: /`, `Disallow: /admin`, sitemap link |
| Header/footer on every public page | ✅ Verified in HTML for all routes |
| Mobile menu | ✅ Rendered by `SiteHeader` (client component, toggles with `aria-expanded`; closes on route change) |

## Deviations & Open Questions

1. **Public route-group layout added** — `src/app/(public)/layout.tsx` holds the header/footer instead of the root layout, because `/admin` shares the same root and needs a clean shell. The root layout keeps fonts, metadata and `<html>`.
2. **`generateStaticParams` + freshness** — service detail pages are listed as SSG at build because `generateStaticParams` takes precedence over `dynamic`/`revalidate` exports. To keep the content-editability promise, the Phase 3 admin content actions will call `revalidatePath()` for the affected service (and list pages) after saves/deletes. New services will render on demand (`dynamicParams` default).
3. **Prisma pinned to 6.19.3** — npm's `latest` tag resolves to a Prisma 8 release candidate; pinned to v6 as the plan specifies.
4. **zod 4 installed** — the plan doesn't pin a major. Phase 2 schemas will use the v4-compatible API (`.min/.max/.regex/.refine`, `z.enum`) with human-readable messages.
5. **npm 12 install-script blocking** — `package.json` now has an `allowScripts` block for Prisma/esbuild; without it npm 12 silently skips required postinstall steps.
6. **Favicon** — the plan's `.ico` fallback was used: `/public/favicon.svg` is shipped and referenced from metadata (no image converter available).
7. **Extra shared components/files** beyond the listed tree: `Icon.tsx`, `PageHero.tsx`, `SectionHeading.tsx`, `lib/content.ts`, `content/seed/types.ts`. All are small, single-purpose helpers that avoid duplication; no dependencies added.
8. **Placeholder panels** — the book, contact, quote, data-recovery, remote-support and track pages currently show friendly "form is being connected next" panels with the owner's email/phone. These are replaced by real forms in Phase 2 (track lookup in Phase 4).
9. **Track page** — built as a non-functional shell in Phase 1 so every nav route resolves; the lookup action and security rules land in Phase 4 per the plan.
10. **README admin credentials** — the starter admin login is documented as required by the plan; the portal itself arrives in Phase 3.

## Open Questions

None blocking. Owner decisions still outstanding (tracked in `HANDOFF.md` §4): final business name, domain, AnyDesk ID details, ABN.
