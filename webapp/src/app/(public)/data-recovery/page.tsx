import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { DataRecoveryForm } from "@/components/forms/DataRecoveryForm";

export const metadata: Metadata = {
  title: "Data Recovery",
  description:
    "Lost photos or important files? Free assessment and honest advice for data recovery in Perth. No data recovered, no recovery fee.",
};

const STEPS = [
  {
    icon: "drive",
    title: "Bring it or send it in",
    text: "Laptop, desktop, external drive, USB stick or phone. Arrange a drop-off — or ask about metro pick-up.",
  },
  {
    icon: "tool",
    title: "Free assessment",
    text: "We look carefully at the device and tell you what's possible, in plain English — before charging anything.",
  },
  {
    icon: "check-circle",
    title: "Honest quote, then recovery",
    text: "If the data is recoverable, you get a fixed price. Then we recover it, return it, and securely delete our working copies.",
  },
] as const;

export default function DataRecoveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Data recovery"
        title="Losing files is horrible. Let's see what we can get back."
        intro="Photos, documents, years of memories — don't give up on them yet. We offer a free assessment and honest advice, and there's no recovery fee if we can't get your data back."
      >
        <div className="flex flex-wrap gap-2">
          <span className="pill">Free assessment</span>
          <span className="pill">No data, no fee</span>
          <span className="pill">Workshop drop-off</span>
          <span className="pill">Confidential handling</span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:flex sm:items-start sm:gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-dark">
              <Icon name="sparkle" size={20} />
            </span>
            <div className="mt-3 sm:mt-0">
              <h2 className="font-display text-base font-bold text-ink">Stop using the device if you can</h2>
              <p className="mt-1 text-sm leading-relaxed">
                Every time a failing drive is used or restarted, the chance of recovery drops. Unplug it, leave it alone, and get in
                touch — that&apos;s the single most helpful thing you can do.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={step.icon} size={20} />
                  </span>
                  <span className="font-display text-2xl font-bold text-muted">0{index + 1}</span>
                </div>
                <h2 className="mt-4 font-display text-base font-bold text-ink">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">Start a data recovery request</h2>
              <div className="heading-bar" />
              <div className="mt-6">
                <DataRecoveryForm />
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl bg-primary/5 p-6">
                <h2 className="font-display text-base font-bold text-ink">No data, no fee</h2>
                <p className="mt-1.5 text-sm leading-relaxed">
                  If we can&apos;t recover your data, there&apos;s no recovery fee. You only pay if we get your files back.
                </p>
              </div>
              <div className="card p-6 text-sm">
                <h2 className="font-display text-base font-bold text-ink">Your privacy matters</h2>
                <p className="mt-1.5 leading-relaxed">
                  We only access the files needed for recovery, keep the work confidential, and securely delete our working copies
                  once your data is returned.
                </p>
                <Link href="/privacy" className="mt-3 inline-flex font-semibold text-primary hover:text-primary-dark">
                  Read our privacy page →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
