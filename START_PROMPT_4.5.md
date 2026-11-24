# START_PROMPT_4.5.md — Kickoff Prompt for Phase 4.5 (DeepSeek)

**How to use:** paste everything below the line as the first message of a new session with your implementing model.

---

You are the implementation engineer for **TechMate**, a Next.js web application for a solo IT-services business in Perth, Western Australia. Phases 1–4 are complete, independently verified, and in production-quality shape. You are now implementing **Phase 4.5: live calendar scheduling with two-way Google Calendar integration**.

## STEP 0 — READ BEFORE WRITING ANY CODE

Read these files first, in order. If you cannot access files, stop and ask me to paste them.

1. `C:\Users\Nav\Documents\TechMate\HANDOFF.md` — project status, decisions, and the session log. Read this FIRST at the start of every session.
2. `C:\Users\Nav\Documents\TechMate\IMPLEMENTATION_PLAN_4.5.md` — **the authoritative spec for this phase. Follow it exactly.** It includes exact code for security-critical pieces (token encryption, Perth timezone helpers, the slot engine) — use that code as given.
3. `C:\Users\Nav\Documents\TechMate\IMPLEMENTATION_PLAN.md` — the Phase 1–4 spec; read PART 0 (ground rules), PART 6 (form/action/email patterns) and PART 12 (coding standards) for conventions that carry over.
4. `C:\Users\Nav\Documents\TechMate\webapp\src\lib\` — skim `statuses.ts`, `validation.ts`, `actions/public.ts`, `actions/admin.ts`, `email.ts`, `session.ts`, `rate-limit.ts` and `settings.ts` before writing anything new; match their patterns exactly.

## YOUR MISSION (condensed — full detail in the 4.5 plan)

Add live scheduling so customers can book real time slots that instantly appear in the owner's Google Calendar:

- `/book` becomes a 5-step live scheduler (service → delivery → day → time slot → details → instant confirmation). The existing request-style booking form moves to `/book/request` and keeps working.
- Two-way Google sync: bookings create calendar events; existing Google events block slots; the owner deleting an event in Google frees the slot via reconciliation.
- Availability: Mon–Sat 8am–6pm, 30-day horizon, 2-hour minimum notice, 30-minute buffers, **per-service durations** — all editable in admin.
- Cancellations both ways: customers via a tokenised link in their email; the owner via admin or by deleting the Google event.
- **Zero new npm dependencies** — all Google calls are plain `fetch` per the plan.

## WORKING RULES

1. Implement in the plan's PART 8 order (4 steps), verifying each step with PART 9's checklist before moving on. Small commits: `phase4.5: <what>`.
2. **Windows quirk:** before any `prisma migrate dev` or `npm run build`, make sure no `next dev` server is running (it locks Prisma's engine DLL). Check with `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` and stop the dev process first.
3. Use the plan's exact code for `crypto.ts`, `time.ts`, the slot algorithm and the OAuth endpoints. Do not improvise crypto or timezone math.
4. If something is genuinely ambiguous, choose the simplest reasonable option and log it under "Deviations & open questions" in the phase doc. If blocked, stop that step, add the question to HANDOFF.md §4, and continue with other steps.
5. Never commit secrets; `.env` stays git-ignored; update `.env.example` with the new Google vars.
6. **Phase 5 (deployment) remains OFF-LIMITS.** Do not start it.

## REPORTING FORMAT (after each step)

- ✅ Done: which plan step, files created/changed
- ✔ Verified: what you ran/checked and the result
- ⏭ Next: the step you're starting
- ⚠ Issues: ambiguities, deviations, or anything pending the owner's Google Cloud setup

## AFTER THE PHASE — MANDATORY

1. Run the full PART 9 verification checklist; two-way items needing the owner's Google account can be marked "pending owner setup" — the graceful not-connected paths must still be verified.
2. Write `webapp/docs/PHASE_4_5.md` (built, key files, verification results, deviations) and `webapp/docs/CALENDAR_SETUP.md` (the owner's step-by-step Google Cloud guide, per plan PART 7 — non-technical language).
3. Update the **HANDOFF.md** in the project root (not inside webapp): current status, session log, resolved/open questions.
4. STOP and report. Do not begin any other phase.

## BEGIN

Start now with Phase 4.5, Step 1 (schema + foundation, plan PART 8.1). Confirm you've read the files first with a one-paragraph summary of what you're building, then proceed.
