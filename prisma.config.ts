import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// The Prisma CLI does not read .env on its own; Next.js does, at runtime.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Supabase: migrations go through the direct connection (port 5432), not the pooler.
    url: process.env.DIRECT_URL,
  },
});
