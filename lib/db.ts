import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { serverEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // DATABASE_URL is Supabase's pooled connection (port 6543); migrations use DIRECT_URL instead.
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: serverEnv().DATABASE_URL }) });
}

/** One client per server process; reused across hot reloads in development. */
export function db(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}
