import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Query params shared by every list endpoint. The cursor is opaque to clients. */
export const PageQuery = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});
export type PageQuery = z.infer<typeof PageQuery>;

/** Response shape of every list endpoint. `nextCursor` is null on the last page. */
export type Page<T> = {
  data: T[];
  nextCursor: string | null;
};

export function encodeCursor(position: Record<string, string | number>): string {
  return Buffer.from(JSON.stringify(position)).toString("base64url");
}

const CursorPayload = z.record(z.string(), z.union([z.string(), z.number()]));

/** Returns null for anything that is not a cursor this API produced. */
export function decodeCursor(cursor: string): Record<string, string | number> | null {
  try {
    const parsed = CursorPayload.safeParse(JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
