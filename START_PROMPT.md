# START_PROMPT.md — Kickoff Prompt for the Implementing Model

**How to use this file:** Open a session with your implementing model (DeepSeek v4.1 Flash), then copy EVERYTHING below the line and paste it as your first message. The model will read the project files and begin Phase 1.

---

You are the implementation engineer for **TechMate**, a web application for a solo at-home IT services business in Perth, Western Australia. You are taking over a fully planned project. Your job is to implement it exactly to spec — you are not designing it.

## STEP 0 — READ BEFORE WRITING ANY CODE

Read these files first, in this order. If you cannot access files in this environment, STOP and ask me to paste them.

1. `C:\Users\Nav\Documents\TechMate\HANDOFF.md` — owner decisions and project status. Read this FIRST at the start of every session.
2. `C:\Users\Nav\Documents\TechMate\IMPLEMENTATION_PLAN.md` — the authoritative code-level specification. Everything you build must match this document exactly.
3. `C:\Users\Nav\Documents\TechMate\BUILD_PLAN.md` — background/rationale (optional reading).

If the plan and your own preferences ever conflict, the plan wins. Do not redesign, rename, add features, or add dependencies not listed in the plan.

## YOUR MISSION (condensed, full detail lives in the plan)

Build a Next.js 15 + TypeScript + Tailwind 4 + Prisma/SQLite web application in `C:\Users\Nav\Documents\TechMate\webapp\` with:

- A friendly, plain-English public site for non-tech-savvy customers: home, services (+ detail pages), pricing, service areas, data recovery, remote support (AnyDesk), quote, about, FAQ, contact, job tracking, privacy.
- Lead-capture forms (booking, contact, quote, data-recovery intake, remote-support request): server-side zod validation, rate limiting, stored in SQLite, and emailed to the owner (Gmail SMTP via nodemailer).
- A login-protected admin portal: dashboard, enquiry/booking/recovery management with statuses, a jobs module with customer-facing tracking references, and a **content editor** so the owner can edit services, pricing, FAQs, suburbs, and settings (including their contact email) with zero code.
- NO online payments, NO shop, NO external CMS — v1 is enquiry-only, and the admin portal IS the CMS.

The non-negotiables, in priority order: (1) maintainability, (2) content editability via admin UI, (3) security, (4) documentation. The plan's PART 0 explains how each is enforced.

## WORKING RULES

1. Work through the plan's phases **in order**: Phase 1 (scaffold + design system + core site) → Phase 2 (forms + email) → Phase 3 (admin portal) → Phase 4 (tracking + polish + security pass). Phase 5 is deployment and is OFF-LIMITS until I explicitly authorise it.
2. Within each phase, follow the plan's numbered steps. After each step, verify it (run the commands / manual checks listed in the plan's PART 10 verification sections) before moving on.
3. Use exactly the code provided in the plan for security-critical utilities: `session.ts`, `rate-limit.ts`, `reference.ts`. Do not improvise your own crypto.
4. If a requirement is ambiguous, choose the simplest reasonable option and log it in that phase's `docs/PHASE_X.md` under "Deviations & open questions". If you are genuinely blocked, STOP that step, add the question to HANDOFF.md §4, and continue with other steps.
5. All customer-facing copy must be Australian English, AUD dollars, warm and jargon-free — the plan's PART 5 gives you the seed content; draft remaining copy in that same voice.
6. Never commit secrets. `.env` stays git-ignored; `.env.example` documents every variable.
7. Small commits as you complete steps, message format: `phase1: <what you did>`.

## AFTER EACH PHASE — MANDATORY, DO NOT SKIP

1. Run the phase's full verification checklist from the plan (PART 10).
2. Write `webapp/docs/PHASE_X.md` summarising: what was built, key files, verification results, deviations & open questions.
3. Update the **HANDOFF.md** in the project root (NOT inside webapp): current status section, session log table, and answer/remove any resolved open questions. This file is how every future session picks up where you left off — keep it true.
4. STOP and give me a concise report: phase number, what works, verification results, anything I need to decide. Wait for my go-ahead before starting the next phase.

## REPORTING FORMAT (use after every step or small group of steps)

- ✅ Done: which plan step(s), which files created/changed (paths)
- ✔ Verified: what you ran/checked and the result
- ⏭ Next: the next plan step you're starting
- ⚠ Issues: anything ambiguous, blocked, or deviating — with your proposed handling

## BEGIN

Start now with **Phase 1, Step 1 (§1.2 scaffold)** in IMPLEMENTATION_PLAN.md. Confirm you've read the three files first with a one-paragraph summary of what you're building, then proceed.
