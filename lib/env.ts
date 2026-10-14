import { z } from "zod";

/**
 * Server environment, validated on first use rather than at import so the app still builds
 * when a service is not configured yet (Fase 0 has no database or storage keys).
 */
const ServerEnv = z.object({
  DATABASE_URL: z.url(),
});

let cached: z.infer<typeof ServerEnv> | null = null;

export function serverEnv() {
  if (cached) return cached;
  const result = ServerEnv.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${missing}. See .env.example.`);
  }
  cached = result.data;
  return cached;
}
