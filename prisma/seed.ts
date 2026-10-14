/**
 * Syncs the Template table with the code catalog (remotion/catalog.ts).
 * Safe to run repeatedly: existing rows are updated, new templates are inserted.
 *   npm run db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { TEMPLATE_CATALOG } from "../remotion/catalog";
import { paramsJsonSchema } from "../remotion/shared/params";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DIRECT_URL or DATABASE_URL before seeding.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  for (const [index, t] of TEMPLATE_CATALOG.entries()) {
    const data = {
      name: t.name,
      description: t.description,
      type: t.type,
      isPremium: t.isPremium,
      paramSchema: paramsJsonSchema(t.params),
      sortOrder: index,
      publishedAt: new Date(t.publishedAt),
    };
    await prisma.template.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
    console.log(`template ${t.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
