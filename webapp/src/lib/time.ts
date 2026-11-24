/**
 * Western Australia has no daylight saving, so Perth is always UTC+8.
 * Build a UTC Date from a Perth calendar date (+ optional HH:MM).
 */
export function perthDate(dateStr: string, hhmm = "00:00"): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - 8, mm));
}

export function perthDateString(date: Date): string {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function perthTimeLabel(date: Date): string {
  const perth = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const h = perth.getUTCHours();
  const mm = String(perth.getUTCMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

/** Perth weekday number: Monday = 1 … Sunday = 7 (matches scheduler settings). */
export function perthWeekday(dateStr: string): number {
  const day = perthDate(dateStr).getUTCDay(); // 0 = Sunday
  return day === 0 ? 7 : day;
}

/** Add whole days to a YYYY-MM-DD string without timezone drift. */
export function addDays(dateStr: string, days: number): string {
  return perthDateString(new Date(perthDate(dateStr).getTime() + days * 24 * 60 * 60 * 1000));
}

/** Friendly Perth label, e.g. "Friday 5 December". */
export function perthFriendlyDate(date: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Perth",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
