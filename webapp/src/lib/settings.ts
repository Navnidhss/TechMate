import { prisma } from "@/lib/db";

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  businessName: string;
  tagline: string;
  tradingHours: string;
  anydeskInfo: string;
  workshopAddress: string;
  abn: string;
}

/**
 * Fallbacks mirror src/content/seed/settings.ts.
 * The database value always wins at runtime; contactEmail falls back to the
 * OWNER_EMAIL_FALLBACK env var so a fresh install still emails the owner.
 */
const DEFAULTS: SiteSettings = {
  contactEmail: process.env.OWNER_EMAIL_FALLBACK ?? "nsabharwal97@gmail.com",
  contactPhone: "0400 000 000",
  businessName: "TechMate",
  tagline: "Friendly IT help that comes to you — Perth metro",
  tradingHours: "Monday–Saturday 8am–6pm · Sunday by appointment",
  anydeskInfo:
    "Download AnyDesk from anydesk.com, then send us your 9-digit ID and we'll connect.",
  workshopAddress: "Drop-off available across Perth metro — address confirmed when you book.",
  abn: "",
};

const KNOWN_KEYS = Object.keys(DEFAULTS) as (keyof SiteSettings)[];

/** Read all site settings, merged over the defaults above. */
export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const settings = { ...DEFAULTS };

  for (const row of rows) {
    if (KNOWN_KEYS.includes(row.key as keyof SiteSettings)) {
      settings[row.key as keyof SiteSettings] = row.value;
    }
  }

  if (!settings.contactEmail) settings.contactEmail = DEFAULTS.contactEmail;
  return settings;
}
