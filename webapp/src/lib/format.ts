const dateTimeFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Australia/Perth",
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeZone: "Australia/Perth",
});

/** e.g. "24 Nov 2026, 3:42 pm" — always Perth time. */
export function formatDateTime(value: Date): string {
  return dateTimeFormatter.format(value);
}

/** e.g. "24 Nov 2026". */
export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

/** e.g. "Tue 24 Nov" for compact admin lists. */
export function formatShortDate(value: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Perth",
  }).format(value);
}
