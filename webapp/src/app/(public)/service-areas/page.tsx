import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { getAreasByZone } from "@/lib/content";

export const metadata: Metadata = {
  title: "Service Areas — Perth Metro",
  description:
    "TechMate covers the whole Perth metro area — from Joondalup and the northern suburbs to Mandurah and the Peel region, plus the hills and coast.",
};

export default async function ServiceAreasPage() {
  const zones = await getAreasByZone();
  const totalSuburbs = zones.reduce((count, zone) => count + zone.suburbs.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Service areas"
        title="We cover the whole Perth metro"
        intro={`From Joondalup to Mandurah, and the coast to the hills — ${totalSuburbs}+ suburbs and growing. Onsite visits, remote help and workshop drop-off are all available across the metro.`}
      >
        <div className="flex flex-wrap gap-2">
          <span className="pill">Onsite home visits</span>
          <span className="pill">Remote support</span>
          <span className="pill">Workshop drop-off</span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((zone) => (
              <div key={zone.zone} className="card p-6">
                <div className="flex items-center gap-2">
                  <Icon name="pin" size={18} className="text-primary" />
                  <h2 className="font-display text-base font-bold text-ink">{zone.zone}</h2>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {zone.suburbs.map((suburb) => (
                    <li
                      key={suburb}
                      className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-body"
                    >
                      {suburb}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Not listed? If you&apos;re near Perth, just ask.</h2>
              <p className="mt-1 text-sm leading-relaxed">
                We&apos;ll tell you honestly whether we can get to you — and if we can&apos;t, we&apos;ll point you to someone who can.
              </p>
            </div>
            <Link href="/contact" className="btn-primary mt-4 shrink-0 sm:mt-0">
              Ask about your suburb
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Book a visit in your suburb"
        text="Pick a day and time that suits — we'll confirm and give you a fixed quote before any work begins."
      />
    </>
  );
}
