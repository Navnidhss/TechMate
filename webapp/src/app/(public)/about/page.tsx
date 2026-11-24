import type { Metadata } from "next";

import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "TechMate is a local, solo-run IT service for Perth homes and small businesses — plain English, honest advice and patient help.",
};

const VALUES = [
  {
    icon: "headset",
    title: "Plain English",
    text: "No jargon, no acronyms, no talking down to you. If you don't understand something, we'll explain it a different way.",
  },
  {
    icon: "heart",
    title: "Honest advice",
    text: "If a repair isn't worth the money, we'll say so. We'd rather keep your trust than make a quick sale.",
  },
  {
    icon: "clock",
    title: "On time",
    text: "We turn up when we say we will, and keep you posted if anything changes. Your time matters.",
  },
  {
    icon: "sparkle",
    title: "Patient",
    text: "Ask the same question twice — or five times. We're here to help, not to make you feel silly.",
  },
] as const;

const STORY = [
  "TechMate is a small, local IT service run by one person who genuinely likes helping people with their technology. After years of fixing computers for friends, family and small businesses, it became clear that what most people want isn't a lecture — it's someone patient who will just sort it out and explain what happened.",
  "That's the whole idea: friendly, straightforward help that comes to you. Whether it's a laptop that's given up, a printer that won't connect, or a home office that needs setting up properly, we take the time to do it right and make sure you understand what we've done.",
  "We keep the business small on purpose. You deal with the same person from the first message to the final handover, and you're never pushed into something you don't need.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About TechMate"
        title="Local, patient help — from someone who actually likes this stuff"
        intro="A one-person IT service for Perth homes and small businesses. No call centres, no scripts, no pressure."
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Why TechMate exists</h2>
            <div className="heading-bar" />
            <div className="prose-plain mt-5">
              {STORY.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink">What you can expect</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "A real person replies to your enquiry — usually the same day",
                "A fixed quote before any work begins",
                "Onsite, remote or workshop — your choice",
                "Everything explained in plain English",
                "Your privacy respected, always",
                "No fix, no fee",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-surface p-4 text-sm">
              <p className="font-semibold text-ink">One thing we won&apos;t do</p>
              <p className="mt-1 leading-relaxed">
                Talk you into something you don&apos;t need. If your computer has had its day, we&apos;ll tell you that too.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-card py-16">
        <div className="container-page">
          <SectionHeading eyebrow="How we work" title="The things we care about" align="center" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="card p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={value.icon} size={20} />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Have a problem you've been putting off?"
        text="Most people wait far too long with a slow or misbehaving computer. Tell us what's happening — a quick chat costs nothing."
      />
    </>
  );
}
