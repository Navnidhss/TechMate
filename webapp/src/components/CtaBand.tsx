import Link from "next/link";

import { Icon } from "@/components/Icon";

export interface CtaBandProps {
  title?: string;
  text?: string;
  buttonLabel?: string;
  href?: string;
}

/** Reusable closing call-to-action band used at the bottom of most pages. */
export function CtaBand({
  title = "Ready to get things working again?",
  text = "Tell us what's going on. We'll call or email you back, usually the same day, with clear next steps and a fixed quote.",
  buttonLabel = "Book a visit",
  href = "/book",
}: CtaBandProps) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-white sm:px-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-light/30 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-teal-50/90 sm:text-base">{text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={href} className="btn-accent">
                {buttonLabel}
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link
                href="/contact"
                className="btn border border-white/30 bg-white/5 text-white hover:bg-white/15"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
