import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Describe the job and get a free, no-obligation fixed quote for computer repair, IT support or data recovery in Perth.",
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Free quote"
        title="Know the price before you commit"
        intro="Tell us what you need and we'll come back with a fixed quote — free, no obligation, and in plain English."
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Request a quote</h2>
            <div className="heading-bar" />
            <div className="mt-6">
              <QuoteForm />
            </div>
          </div>

          <aside className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">What happens next</h2>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                { title: "We read your request", text: "A real person looks at the details you send — no automated reply." },
                { title: "We ask anything we need", text: "If a couple more details would help us quote accurately, we'll ask." },
                { title: "You get a fixed price", text: "Clear and itemised in plain English, with no obligation to go ahead." },
                { title: "You decide", text: "Happy with it? We book a time. Not sure? We're happy to answer more questions." },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
