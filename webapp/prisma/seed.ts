/**
 * Database seed — safe to run repeatedly.
 *
 * Upserts use an empty `update` on purpose: rows that already exist are left
 * alone, so re-seeding never overwrites content the owner has edited in the
 * admin. Only missing rows are created.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedAreas } from "../src/content/seed/areas";
import { seedFaqs } from "../src/content/seed/faqs";
import { seedServices } from "../src/content/seed/services";
import { seedSettings } from "../src/content/seed/settings";

const prisma = new PrismaClient();

/** Temporary credentials — the owner is forced to change them on first login. */
const SEED_ADMIN_USERNAME = "admin";
const SEED_ADMIN_PASSWORD = "TechMateAdmin2025!";

async function main() {
  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        slug: service.slug,
        name: service.name,
        shortDesc: service.shortDesc,
        description: service.description,
        delivery: service.delivery,
        priceFrom: service.priceFrom ?? null,
        priceNotes: service.priceNotes ?? null,
        icon: service.icon ?? null,
        sortOrder: service.sortOrder,
        active: true,
      },
    });
  }

  for (const area of seedAreas) {
    await prisma.serviceArea.upsert({
      where: { zone_suburb: { zone: area.zone, suburb: area.suburb } },
      update: {},
      create: area,
    });
  }

  for (const faq of seedFaqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (!existing) await prisma.faq.create({ data: faq });
  }

  for (const setting of seedSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username: SEED_ADMIN_USERNAME },
  });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        username: SEED_ADMIN_USERNAME,
        passwordHash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 10),
        mustChangePassword: true,
      },
    });
    console.log(`Created admin user "${SEED_ADMIN_USERNAME}" (must change password on first login).`);
  }

  console.log(
    `Seed complete: ${seedServices.length} services, ${seedAreas.length} areas, ${seedFaqs.length} FAQs, ${seedSettings.length} settings.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
