import Link from "next/link";

import { Icon } from "@/components/Icon";
import { parseCsv } from "@/lib/content";
import { DELIVERY_SHORT_LABELS } from "@/lib/statuses";

export interface ServiceCardProps {
  service: {
    slug: string;
    name: string;
    shortDesc: string;
    delivery: string;
    priceFrom: string | null;
    icon: string | null;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const delivery = parseCsv(service.delivery);

  return (
    <article className="card group flex h-full flex-col p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={service.icon ?? "tool"} size={22} />
        </span>
        {service.priceFrom && (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-dark">
            {service.priceFrom}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-ink">
        <Link href={`/services/${service.slug}`} className="transition-colors group-hover:text-primary">
          {service.name}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed">{service.shortDesc}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {delivery.map((option) => (
          <span key={option} className="pill">
            {DELIVERY_SHORT_LABELS[option] ?? option}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
        <Link
          href={`/services/${service.slug}`}
          className="font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          Learn more
        </Link>
        <Link
          href={`/book?service=${service.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-ink transition-colors hover:text-primary"
        >
          Book this
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </article>
  );
}
