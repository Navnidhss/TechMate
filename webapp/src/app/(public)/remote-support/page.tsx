import type { Metadata } from "next";

import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { RemoteSupportForm } from "@/components/forms/RemoteSupportForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Remote Support",
  description:
    "Get help over the screen with AnyDesk — safe, simple remote support anywhere in Perth, often the same day.",
};

const ANYDESK_STEPS = [
  {
    title: "Download AnyDesk",
    text: "Go to anydesk.com in your browser and download the free app. No account or sign-up needed.",
  },
  {
    title: "Read us your 9-digit ID",
    text: "Open AnyDesk and tell us the number shown on your screen. That's how we connect to you.",
  },
  {
    title: "Approve the connection",
    text: "You'll see a prompt asking to accept. You can watch everything we do and disconnect at any time.",
  },
] as const;

const REMOTE_FIXES = [
  "Slow or freezing computers",
  "Virus and malware clean-ups",
  "Email and account problems",
  "Printer and device setup",
  "Software installs and updates",
  "Phone and tablet help",
  "Backup and security checks",
  "Explaining what's gone wrong",
] as const;

export default async function RemoteSupportPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Remote support"
        title="We can fix it while you watch"
        intro="Remote support means we connect to your screen with your permission and sort the problem out — no waiting for a visit, often the same day."
      >
        <div className="flex flex-wrap gap-2">
          <span className="pill">AnyDesk</span>
          <span className="pill">You stay in control</span>
          <span className="pill">Same-day help</span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">How AnyDesk works</h2>
            <div className="heading-bar" />
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              It sounds technical, but it&apos;s genuinely simple. Three steps, and you can stop it whenever you like.
            </p>

            <ol className="mt-6 space-y-4">
              {ANYDESK_STEPS.map((step, index) => (
                <li key={step.title} className="card flex gap-4 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl bg-primary/5 p-5 text-sm">
              <p className="font-semibold text-ink">Our quick guide</p>
              <p className="mt-1 leading-relaxed">{settings.anydeskInfo}</p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink">What we can fix remotely</h2>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-1">
                {REMOTE_FIXES.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-card p-6 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="lock" size={18} className="text-primary" />
                <h2 className="font-display text-base font-bold text-ink">Safe by design</h2>
              </div>
              <p className="mt-2 leading-relaxed">
                We can only see your screen when you approve a session. You can watch every action, and closing AnyDesk ends the
                connection immediately.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-card py-16">
        <div className="container-page max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-ink">Request remote help</h2>
          <div className="heading-bar" />
          <div className="mt-6">
            <RemoteSupportForm />
          </div>
        </div>
      </section>
    </>
  );
}
