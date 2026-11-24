import type { SeedFaq } from "./types";

/** Starter FAQs — the owner can rewrite these at /admin/content/faq. */
export const seedFaqs: SeedFaq[] = [
  {
    question: "Do you charge a call-out fee?",
    answer:
      "No call-out fee for bookings within the Perth metro — we'll always confirm the details and give you a fixed quote before any work starts.",
    sortOrder: 1,
  },
  {
    question: "What areas do you cover?",
    answer:
      "The whole Perth metro area, from Joondalup to Mandurah and the coast to the hills. If you're a bit further out, just ask — we'll let you know honestly if we can help.",
    sortOrder: 2,
  },
  {
    question: "How does remote support work?",
    answer:
      "It's easier than it sounds. You download a small program called AnyDesk from the official site, read us the 9-digit number on your screen, and we can see what you see — with your permission — and fix it while you watch. You're in control the whole time.",
    sortOrder: 3,
  },
  {
    question: "Is my personal data safe?",
    answer:
      "Absolutely. Your privacy is taken seriously — we only access what's needed for the job, never browse your personal files for fun, and data recovered for you is handled carefully and returned or securely deleted. See our privacy page for details.",
    sortOrder: 4,
  },
  {
    question: "What if you can't fix it?",
    answer:
      "Then you don't pay for the fix. We'll be upfront about what's wrong, what it would cost, and whether it's even worth repairing — sometimes the honest answer is \"time for a new one\", and we'll tell you that.",
    sortOrder: 5,
  },
  {
    question: "Do you sell computers and parts?",
    answer:
      "Yes — we can source quality laptops, parts and software licences for you. Tell us what you use your computer for and your budget, and we'll find the right fit rather than the biggest price tag.",
    sortOrder: 6,
  },
  {
    question: "How soon can you come out?",
    answer:
      "Often same or next business day for urgent jobs across the metro. For remote support, we can usually connect with you the same day.",
    sortOrder: 7,
  },
  {
    question: "Do you help with Macs and Apple devices?",
    answer:
      "Yes — MacBooks, iMacs, iPhones and iPads are all part of a day's work.",
    sortOrder: 8,
  },
];
