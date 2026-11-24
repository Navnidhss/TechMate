/**
 * The only allowed status values. SQLite has no enums, so every status
 * written to the database is validated against these lists.
 */
export const BOOKING_STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export const QUOTE_STATUSES = ["new", "contacted", "quoted", "accepted", "declined", "closed"] as const;
export const RECOVERY_STATUSES = [
  "new",
  "assessing",
  "quoted",
  "in-progress",
  "recovered",
  "unrecoverable",
  "closed",
] as const;
export const REMOTE_STATUSES = ["new", "contacted", "connected", "completed", "closed"] as const;
export const JOB_STATUSES = [
  "received",
  "in-progress",
  "awaiting-parts",
  "awaiting-customer",
  "completed",
  "cancelled",
] as const;
export const DELIVERY_OPTIONS = ["onsite", "remote", "workshop"] as const;
export const TIME_OPTIONS = ["morning", "afternoon", "evening", "flexible"] as const;
export const URGENCY_OPTIONS = ["asap", "today", "this-week"] as const;
export const IMPORTANCE_OPTIONS = ["critical", "important", "nice-to-have"] as const;
export const DEVICE_TYPES = ["desktop-pc", "laptop", "external-drive", "usb-stick", "phone", "other"] as const;
export const BUDGET_OPTIONS = ["under-500", "500-1000", "1000-2000", "not-sure"] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number];

/** Human-friendly labels for admin dropdowns and customer-facing badges. */
export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  assessing: "Assessing",
  "in-progress": "In progress",
  recovered: "Recovered",
  unrecoverable: "Unrecoverable",
  received: "Received",
  "awaiting-parts": "Waiting on parts",
  "awaiting-customer": "Waiting on customer",
  connected: "Connected",
};

export const DELIVERY_LABELS: Record<string, string> = {
  onsite: "Onsite — we come to you",
  remote: "Remote — we connect to your screen",
  workshop: "Workshop — drop-off",
};

export const DELIVERY_SHORT_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  workshop: "Workshop",
};

export const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8am–12pm)",
  afternoon: "Afternoon (12pm–5pm)",
  evening: "Evening (5pm–7pm)",
  flexible: "Flexible",
};

export const BUDGET_LABELS: Record<string, string> = {
  "under-500": "Under $500",
  "500-1000": "$500 – $1,000",
  "1000-2000": "$1,000 – $2,000",
  "not-sure": "Not sure yet",
};

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  "desktop-pc": "Desktop computer",
  laptop: "Laptop",
  "external-drive": "External hard drive",
  "usb-stick": "USB stick",
  phone: "Phone or tablet",
  other: "Something else",
};

export const IMPORTANCE_LABELS: Record<string, string> = {
  critical: "Critical — really need these files back",
  important: "Important — hard to replace",
  "nice-to-have": "Nice to have",
};

export const URGENCY_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  today: "Today if possible",
  "this-week": "Sometime this week",
};
