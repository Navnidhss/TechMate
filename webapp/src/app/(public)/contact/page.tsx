import type { Metadata } from "next";
import Link from "next/link";

import { ContactDetails } from "@/components/ContactDetails";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with TechMate — email, phone or send a message. Friendly help for Perth homes and small businesses.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Say hello — we don't bite"
        intro="Not sure what you need or whether it's worth fixing? Ask us. There's no charge for a quick question, and we answer every message personally."
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Send us a message</h2>
            <div className="heading-bar" />
            <div className="mt-6">
              <ContactForm />
            </div>
            <p className="mt-5 text-sm">
              Prefer to book straight away?{" "}
              <Link href="/book" className="font-semibold text-primary hover:text-primary-dark">
                Book a visit
              </Link>{" "}
              — it only takes a minute.
            </p>
          </div>

          <div className="space-y-5">
            <ContactDetails settings={settings} />
            <div className="rounded-2xl bg-primary/5 p-6 text-sm">
              <p className="font-semibold text-ink">Remote support, right now?</p>
              <p className="mt-1 leading-relaxed">{settings.anydeskInfo}</p>
              <Link
                href="/remote-support"
                className="mt-3 inline-flex font-semibold text-primary hover:text-primary-dark"
              >
                How remote support works →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
