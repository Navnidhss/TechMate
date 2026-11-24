import { Icon } from "@/components/Icon";
import type { SiteSettings } from "@/lib/settings";

export interface ContactDetailsProps {
  settings: SiteSettings;
  /** "full" shows every detail; "compact" is for sidebars. */
  variant?: "full" | "compact";
}

/** Contact block rendered entirely from editable SiteSettings. */
export function ContactDetails({ settings, variant = "full" }: ContactDetailsProps) {
  const telHref = `tel:${settings.contactPhone.replace(/[^0-9+]/g, "")}`;

  return (
    <div className={variant === "full" ? "card p-6" : "space-y-3 text-sm"}>
      {variant === "full" && (
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Ways to reach us</h2>
      )}
      <ul className={variant === "full" ? "space-y-4" : "space-y-3"}>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="mail" size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
            <a href={`mailto:${settings.contactEmail}`} className="break-all text-sm font-medium text-ink hover:text-primary">
              {settings.contactEmail}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="phone" size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</p>
            <a href={telHref} className="text-sm font-medium text-ink hover:text-primary">
              {settings.contactPhone}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="clock" size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hours</p>
            <p className="text-sm font-medium text-ink">{settings.tradingHours}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="pin" size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Workshop &amp; drop-off</p>
            <p className="text-sm font-medium text-ink">{settings.workshopAddress}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
