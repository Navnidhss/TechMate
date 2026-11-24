import type { SeedSetting } from "./types";

/**
 * Default site settings. contactEmail is the single place enquiry emails go —
 * change it at /admin/content/settings (or here before first seed).
 */
export const seedSettings: SeedSetting[] = [
  { key: "contactEmail", value: "nsabharwal97@gmail.com" },
  { key: "contactPhone", value: "0400 000 000" },
  { key: "businessName", value: "TechMate" },
  {
    key: "tagline",
    value: "Friendly IT help that comes to you — Perth metro",
  },
  {
    key: "tradingHours",
    value: "Monday–Saturday 8am–6pm · Sunday by appointment",
  },
  {
    key: "anydeskInfo",
    value:
      "Download AnyDesk from anydesk.com, then send us your 9-digit ID and we'll connect.",
  },
  {
    key: "workshopAddress",
    value: "Drop-off available across Perth metro — address confirmed when you book.",
  },
  { key: "abn", value: "" },
];
