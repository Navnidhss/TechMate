# Phase 2 — Lead Capture (forms, validation, rate limiting, email)

**Status:** Complete (awaiting owner review before Phase 3)
**Date:** Session 4

---

## What Was Built

- `src/lib/validation.ts` — every zod schema from the spec, with human, non-technical error messages: booking, enquiry, quote, data recovery, remote support, plus the job-reference schema for Phase 4. Includes `formDataToObject` and `fieldErrorsFrom` helpers.
- `src/lib/rate-limit.ts` — the plan's exact in-memory limiter (5 requests / 10 minutes per action+IP by default).
- `src/lib/email.ts` — Gmail SMTP via nodemailer:
  - skips gracefully and logs when SMTP isn't configured,
  - strips spaces from Gmail app passwords (they're usually shown in four groups),
  - owner recipient comes from the editable `contactEmail` setting (env fallback),
  - plain-text owner notification with `Reply-To` set to the customer,
  - friendly customer acknowledgement per form type,
  - every call is fire-and-forget: email failures never break a submission.
- `src/lib/actions/public.ts` — five server actions (`submitBooking`, `submitEnquiry`, `submitQuote`, `submitRecovery`, `submitRemoteSupport`). Each: rate-limit → zod validate → DB write → owner + customer email → typed `ActionResult`.
- Five client forms with inline per-field errors, whole-form alerts, pending button state and a friendly success panel:
  - `BookingForm` — service select (pre-selected from `?service=`), suburb datalist from seeded areas, delivery radios with plain-English blurbs, native date picker, time-of-day radios.
  - `ContactForm`, `QuoteForm` (optional budget), `DataRecoveryForm` (device/importance, "already opened?" checkbox, server-enforced consent), `RemoteSupportForm` (urgency radios).
- Small shared form controls: `FormInput`, `FormTextarea`, `FormSelect`, `FormCheckbox`, `FormRadioGroup`, `FormAlert`, `FormSuccess`, and a `usePublicForm` hook (single `useState` result object per the plan).
- Booking, contact, quote, data-recovery and remote-support pages now render their real forms (placeholder panels removed).

## Key Files

| Path | Purpose |
|---|---|
| `src/lib/validation.ts` | All zod schemas + field-error helpers |
| `src/lib/rate-limit.ts` | Exact spec limiter |
| `src/lib/email.ts` | SMTP transport, owner + customer templates |
| `src/lib/actions/public.ts` | Public server actions |
| `src/components/forms/*` | Five forms + shared controls/hook |

## Verification Results

| Check | Result |
|---|---|
| `npm run build` | ✅ Passes (0 TS errors) |
| `npx eslint src prisma` | ✅ Clean (0 errors, 0 warnings) |
| Valid submission, every form | ✅ Rows created in SQLite (booking, enquiry, quote, recovery, remote support) |
| Invalid submission | ✅ Human field messages returned and rendered inline (name, email, phone, suburb, service, delivery, preferred time, notes all reported) |
| Invalid service slug | ✅ Rejected server-side: "Please choose a service from the list" |
| Recovery consent unchecked | ✅ Server rejects: "Please accept the data handling terms" |
| Rate limiting | ✅ 1 prior + 4 allowed, 5th and 6th within the window rejected with "Too many requests. Please wait a few minutes." |
| Owner email | ✅ Delivered via Gmail SMTP to `nsabharwal97@gmail.com` (logged `[email] sent …`) |
| Customer acknowledgement | ✅ Sent per submission with a plain-English body |
| `contactEmail` setting change | ✅ Changed to `nsabharwal97+techtm-test@gmail.com`, ran a submission → notification went to the new address; setting reverted afterwards |
| Test data cleanup | ✅ All self-test rows deleted; settings restored; temporary test route removed |

Verification was performed through a temporary in-app test endpoint that called the real server actions with real FormData, then inspected the database and email logs. The endpoint was deleted before commit.

## Deviations & Open Questions

1. **Extra shared form-control components** (`FormInput`, `FormTextarea`, `FormSelect`, `FormCheckbox`, `FormRadioGroup`, `FormAlert`, `FormSuccess`, `usePublicForm`) aren't in the plan's file tree. They keep the five forms short and consistent; no dependencies added.
2. **No native `required` attributes.** Browser-native validation would show generic browser bubbles instead of the plan's human messages, so fields are marked visually and with `aria-required`, and validation is server-side. `noValidate` is set on each form.
3. **Email is truly fire-and-forget** (`void … .catch`). On a serverless host, a request that ends immediately may cut a send short; if that becomes an issue at deployment we can await the owner email (small latency cost). Noted for Phase 5.
4. **Rate limiting is in-memory per process** (as specified). Fine for the local, single-instance v1; resets on server restart and won't coordinate across multiple instances.
5. **`SMTP_PASS` whitespace** is stripped before use, because Gmail shows app passwords as four groups of four characters.
6. **Extra status constants** (`QUOTE_STATUSES`, `REMOTE_STATUSES`) were added in Phase 1 so the Phase 3 admin tables have allowed values for the quote and remote-request models (the spec's Prisma schema has status columns for both but its status list only named three sets).
7. **Track validation schema** (`trackReferenceSchema`) was added now while writing `validation.ts`; the page and lookup action still land in Phase 4 as planned.
8. **Booking defaults:** delivery defaults to "onsite"; preferred time intentionally starts unselected so the customer makes a choice (server error prompts them).
9. **Owner notification subject** uses the spec's `[TechMate] New <kind>: <name>` format with human labels ("booking request", "data recovery request").

## Open Questions

None blocking. Owner still to supply: final business name, domain, AnyDesk ID copy, ABN (tracked in `HANDOFF.md` §4).
