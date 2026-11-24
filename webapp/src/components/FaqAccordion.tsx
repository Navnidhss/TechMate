export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  faqs: FaqItem[];
}

/**
 * Accessible FAQ accordion built on native <details> — no JavaScript needed,
 * so it works in server components and with keyboard/screen readers out of the box.
 */
export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      {faqs.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink marker:hidden hover:bg-surface/70 [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-primary transition-transform group-open:rotate-45">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed sm:pr-14">
            <p>{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
