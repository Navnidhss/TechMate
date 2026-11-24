"use client";

import Link from "next/link";
import { useState } from "react";

import { FormAlert } from "@/components/forms/FormAlert";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Icon } from "@/components/Icon";
import { bookAppointment, getSlots, type BookingResult } from "@/lib/actions/calendar";

export interface SchedulerService {
  slug: string;
  name: string;
  shortDesc: string;
  durationMinutes: number;
  delivery: string;
  priceFrom: string | null;
}

export interface SchedulerDate {
  date: string;
  weekday: string;
  day: string;
  month: string;
}

export interface BookingSchedulerProps {
  services: SchedulerService[];
  suburbs: string[];
  dates: SchedulerDate[];
  initialService?: string;
  policyNote: string;
}

const DELIVERY_META: Record<string, { label: string; blurb: string }> = {
  onsite: { label: "Onsite", blurb: "We come to your home — best for Wi-Fi, printers and anything physical." },
  remote: { label: "Remote", blurb: "We connect to your screen with AnyDesk — quick and often same-day." },
  workshop: { label: "Workshop", blurb: "Drop your device off — best for repairs and data recovery." },
};

const STEP_LABELS = ["Service", "How", "Day", "Time", "Details"];

function slotLabel(hhmm: string): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function deliveryOptions(service: SchedulerService | undefined): string[] {
  return (service?.delivery ?? "").split(",").map((value) => value.trim()).filter(Boolean);
}

export function BookingScheduler({
  services,
  suburbs,
  dates,
  initialService,
  policyNote,
}: BookingSchedulerProps) {
  const preselected = services.find((service) => service.slug === initialService);

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [serviceSlug, setServiceSlug] = useState(preselected?.slug ?? "");
  const [delivery, setDelivery] = useState(deliveryOptions(preselected)[0] ?? "");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [pending, setPending] = useState(false);

  const service = services.find((candidate) => candidate.slug === serviceSlug);
  const availableDeliveries = deliveryOptions(service);
  const chosenDate = dates.find((candidate) => candidate.date === date);

  function chooseService(nextSlug: string) {
    const next = services.find((candidate) => candidate.slug === nextSlug);
    setServiceSlug(nextSlug);
    setDelivery(deliveryOptions(next)[0] ?? "");
    setDate("");
    setSlot("");
    setSlots([]);
    setResult(null);
    setStep(2);
  }

  async function loadSlots(nextDate: string) {
    setDate(nextDate);
    setSlot("");
    setSlots([]);
    setSlotsError(null);
    setStep(4);
    setSlotsLoading(true);
    try {
      const formData = new FormData();
      formData.append("serviceSlug", serviceSlug);
      formData.append("date", nextDate);
      const response = await getSlots(formData);
      if (response.ok) {
        setSlots(response.slots);
      } else {
        setSlotsError(response.error ?? "We couldn't load times just now. Please try another day.");
      }
    } catch {
      setSlotsError("We couldn't load times just now. Please try another day.");
    } finally {
      setSlotsLoading(false);
    }
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await bookAppointment(formData);
      setResult(response);
      if (response.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (!response.fieldErrors) {
        // Slot disappeared between picking and confirming — refresh the list.
        await loadSlots(date);
      }
    } catch {
      setResult({ ok: false, error: "Something went wrong at our end. Please try again, or contact us directly." });
    } finally {
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-6 sm:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="check-circle" size={26} />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">You&apos;re booked in!</h2>
        <p className="mt-2 text-base font-semibold text-ink">
          {result.summary} · {service?.name}
        </p>
        <p className="mt-1 text-sm">
          Your reference is <span className="font-mono font-bold text-ink">{result.reference}</span>.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          A confirmation email is on its way, including a link to change or cancel. {policyNote}
        </p>

        {result.cancelUrl && (
          <a
            href={result.cancelUrl}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <Icon name="calendar" size={16} />
            Manage or cancel this booking
          </a>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/" className="btn-primary btn-small">
            Back to home
          </Link>
          <Link href="/services" className="btn-outline btn-small">
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <ol className="mb-6 flex flex-wrap gap-1.5 text-xs" aria-label="Booking steps">
        {STEP_LABELS.map((label, index) => {
          const number = index + 1;
          const active = step === number;
          const done = step > number;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => {
                  if (number < step || (number === 2 && service)) setStep(number);
                }}
                disabled={number >= step}
                aria-current={active ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : done
                      ? "bg-primary/10 text-primary"
                      : "bg-surface text-muted"
                } ${number >= step ? "cursor-default" : ""}`}
              >
                <span className="mr-1 opacity-70">{number}.</span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      {result?.error && (
        <div className="mb-4">
          <FormAlert message={result.error} />
        </div>
      )}

      {/* Step 1 — service */}
      {step === 1 && (
        <div>
          <h2 className="font-display text-lg font-bold text-ink">What do you need help with?</h2>
          <p className="mt-1 text-sm">Pick the closest match — we&apos;ll confirm everything before visiting.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((option) => (
              <button
                key={option.slug}
                type="button"
                onClick={() => chooseService(option.slug)}
                className="card flex items-start gap-3 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name="tool" size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{option.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    About {option.durationMinutes} minutes
                    {option.priceFrom ? ` · ${option.priceFrom}` : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm">
            Rather just tell us what&apos;s going wrong?{" "}
            <Link href="/book/request" className="font-semibold text-primary hover:text-primary-dark">
              Send a request instead →
            </Link>
          </p>
        </div>
      )}

      {/* Step 2 — delivery */}
      {step === 2 && service && (
        <div>
          <h2 className="font-display text-lg font-bold text-ink">How would you like us to help?</h2>
          <p className="mt-1 text-sm">
            {service.name} · about {service.durationMinutes} minutes
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {availableDeliveries.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option}
                  checked={delivery === option}
                  onChange={() => setDelivery(option)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {DELIVERY_META[option]?.label ?? option}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {DELIVERY_META[option]?.blurb ?? ""}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="btn-outline btn-small">
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!delivery}
              className="btn-primary btn-small"
            >
              Choose a day →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — day */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Pick a day</h2>
          <p className="mt-1 text-sm">The next {dates.length} days. Only days we work will have times.</p>

          <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2" role="group" aria-label="Choose a day">
            {dates.map((option) => (
              <button
                key={option.date}
                type="button"
                onClick={() => void loadSlots(option.date)}
                className="flex w-16 shrink-0 snap-start flex-col items-center rounded-xl border border-line bg-card px-2 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {option.weekday}
                </span>
                <span className="font-display text-lg font-bold text-ink">{option.day}</span>
                <span className="text-[11px] text-muted">{option.month}</span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setStep(2)} className="btn-outline btn-small mt-3">
            ← Back
          </button>
        </div>
      )}

      {/* Step 4 — time */}
      {step === 4 && (
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Pick a time{chosenDate ? ` for ${chosenDate.weekday} ${chosenDate.day} ${chosenDate.month}` : ""}
          </h2>

          {slotsLoading && <p className="mt-3 text-sm text-muted">Finding available times…</p>}

          {slotsError && (
            <div className="mt-3">
              <FormAlert message={slotsError} />
            </div>
          )}

          {!slotsLoading && !slotsError && slots.length === 0 && (
            <div className="mt-4 rounded-xl border border-line bg-surface p-5 text-sm">
              <p className="font-semibold text-ink">We&apos;re fully booked this day — try another.</p>
              <button type="button" onClick={() => setStep(3)} className="btn-primary btn-small mt-3">
                Choose another day
              </button>
            </div>
          )}

          {!slotsLoading && slots.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSlot(option);
                    setStep(5);
                  }}
                  className={`rounded-xl border px-2 py-3 text-sm font-semibold transition-colors ${
                    slot === option
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-card text-ink hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {slotLabel(option)}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={() => setStep(3)} className="btn-outline btn-small mt-5">
            ← Back
          </button>
        </div>
      )}

      {/* Step 5 — details */}
      {step === 5 && service && (
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Your details</h2>
          <p className="mt-1 text-sm">
            {service.name} · {chosenDate ? `${chosenDate.weekday} ${chosenDate.day} ${chosenDate.month}` : date} ·{" "}
            {slotLabel(slot)}
          </p>

          <form onSubmit={submitBooking} noValidate className="mt-4 space-y-4">
            <input type="hidden" name="serviceSlug" value={service.slug} />
            <input type="hidden" name="delivery" value={delivery} />
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="slot" value={slot} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                name="name"
                label="Your name"
                required
                autoComplete="name"
                placeholder="e.g. Jenny Smith"
                error={result?.fieldErrors?.name}
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                error={result?.fieldErrors?.email}
              />
              <FormInput
                name="phone"
                label="Phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="0400 000 000"
                error={result?.fieldErrors?.phone}
              />
              <FormInput
                name="suburb"
                label="Suburb"
                required
                autoComplete="address-level2"
                list="scheduler-suburb-list"
                placeholder="e.g. Joondalup"
                error={result?.fieldErrors?.suburb}
              />
              <datalist id="scheduler-suburb-list">
                {suburbs.map((suburb) => (
                  <option key={suburb} value={suburb} />
                ))}
              </datalist>
            </div>

            {delivery === "onsite" ? (
              <FormInput
                name="address"
                label="Address"
                required
                autoComplete="street-address"
                placeholder="Street address for the visit"
                error={result?.fieldErrors?.address}
              />
            ) : (
              <input type="hidden" name="address" value="" />
            )}

            <FormTextarea
              name="notes"
              label="Anything we should know? (optional)"
              placeholder="For example: 'Laptop takes ages to start and freezes when I open email.'"
              error={result?.fieldErrors?.notes}
              hint="No need to diagnose it yourself — just describe what you're seeing."
            />

            <div className="rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted">{policyNote}</div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-accent" disabled={pending}>
                {pending ? "Booking…" : "Book this time"}
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-outline btn-small">
                ← Back
              </button>
            </div>
            <p className="text-xs text-muted">
              By booking you agree to our{" "}
              <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                privacy policy
              </Link>
              . We only use your details for this booking.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
