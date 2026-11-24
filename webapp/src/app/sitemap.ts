import type { MetadataRoute } from "next";

import { getActiveServices } from "@/lib/content";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getActiveServices();
  const now = new Date();

  const staticRoutes = [
    "",
    "/services",
    "/pricing",
    "/service-areas",
    "/book",
    "/book/request",
    "/quote",
    "/data-recovery",
    "/remote-support",
    "/about",
    "/faq",
    "/contact",
    "/track",
    "/privacy",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: `${BASE_URL}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
