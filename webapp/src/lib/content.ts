import { prisma } from "@/lib/db";

/**
 * Small, focused read helpers for public content.
 * Pages call these instead of writing Prisma queries inline.
 */

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

export async function getFaqs() {
  return prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function getServiceAreas() {
  return prisma.serviceArea.findMany({
    orderBy: [{ sortOrder: "asc" }, { suburb: "asc" }],
  });
}

/** Areas grouped by zone, preserving the seeded zone order. */
export async function getAreasByZone(): Promise<{ zone: string; suburbs: string[] }[]> {
  const areas = await getServiceAreas();
  const grouped = new Map<string, string[]>();
  for (const area of areas) {
    const list = grouped.get(area.zone) ?? [];
    list.push(area.suburb);
    grouped.set(area.zone, list);
  }
  return Array.from(grouped, ([zone, suburbs]) => ({ zone, suburbs }));
}

/** Split a CSV column ("onsite,remote") into trimmed, non-empty values. */
export function parseCsv(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Turn a plain-text description into paragraphs for rendering. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
