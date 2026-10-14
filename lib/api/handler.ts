import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { ApiError } from "./errors";

/**
 * Input validation happens here and only here. Route handlers parse the request with
 * these helpers; the services they call receive typed data and do not re-validate.
 */

function validationError(error: z.ZodError) {
  return new ApiError(
    "VALIDATION_ERROR",
    "Data yang dikirim tidak valid.",
    error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  );
}

export function parseQuery<S extends z.ZodType>(request: Request, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new ApiError("INVALID_JSON", "Body request harus berupa JSON yang valid.");
  }
  const result = schema.safeParse(json);
  if (!result.success) throw validationError(result.error);
  return result.data;
}

/**
 * Wraps a route handler so every failure leaves in the standard error shape.
 * Unexpected errors are logged and returned as INTERNAL_ERROR without internals.
 */
export function route<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      // Next.js signals (prerender bail-out, redirect, notFound) are thrown errors; let them through.
      unstable_rethrow(err);
      if (err instanceof ApiError) return err.toResponse();
      console.error("[api] unhandled error", err);
      return new ApiError("INTERNAL_ERROR", "Terjadi kesalahan di server. Coba lagi sebentar.").toResponse();
    }
  };
}
