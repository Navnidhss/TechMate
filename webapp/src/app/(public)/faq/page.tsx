import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/CtaBand";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PageHero } from "@/components/PageHero";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about call-out fees, service areas, remote support, data safety, repairs and more — in plain English.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Questions, answered honestly"
        intro="The things people ask us most often. If your question isn't here, send it through — we answer every message personally."
        align="center"
      />

      <section className="section">
        <div className="container-page max-w-3xl">
          <FaqAccordion faqs={faqs} />

          <div className="mt-8 rounded-2xl border border-line bg-card p-6 text-center">
            <p className="text-sm">
              Still unsure about something?{" "}
              <Link href="/contact" className="font-semibold text-primary hover:text-primary-dark">
                Ask us directly
              </Link>{" "}
              — no obligation, and no question is too small.
            </p>
          </div>
        </div>
      </section>

      <CtaBand title="Ready when you are" text="Book a visit, request remote help, or just tell us what's going wrong." />
    </>
  );
}
