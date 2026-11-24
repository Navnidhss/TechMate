import type { Metadata } from "next";

import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { getActiveServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "IT Services in Perth",
  description:
    "Computer repairs, virus removal, data recovery, Wi-Fi help and friendly IT support across the Perth metro — onsite, remote or workshop.",
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everyday tech help, done properly"
        intro="Whatever's misbehaving — a slow laptop, a stubborn printer, a home network with a mind of its own — we'll sort it out and explain it in plain English. Onsite, remote, or drop it at our workshop."
      >
        <div className="flex flex-wrap gap-2">
          <span className="pill">Onsite visits</span>
          <span className="pill">Remote support</span>
          <span className="pill">Workshop drop-off</span>
          <span className="pill">Fixed quotes</span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-card p-6 text-center">
            <p className="text-sm">
              Not sure which service you need? That&apos;s completely normal.{" "}
              <a href="/contact" className="font-semibold text-primary hover:text-primary-dark">
                Tell us what&apos;s happening
              </a>{" "}
              and we&apos;ll point you in the right direction — no charge for a quick chat.
            </p>
          </div>
        </div>
      </section>

      <CtaBand title="Not sure where to start?" text="Send us a short description of the problem. We'll reply with honest advice and a fixed quote — usually the same day." />
    </>
  );
}
