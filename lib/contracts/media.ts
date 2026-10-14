import { z } from "zod";

// Contract only. Implemented in Fase 1 (week 4: upload to R2).

const MB = 1024 * 1024;

/** PRD 3.2: accepted formats and per-file limits. */
export const MEDIA_LIMITS = {
  "image/jpeg": 64 * MB,
  "image/png": 64 * MB,
  "image/webp": 64 * MB,
  "image/avif": 64 * MB,
  "video/mp4": 100 * MB,
  "video/webm": 100 * MB,
  "video/quicktime": 100 * MB,
} as const;
export type MediaMimeType = keyof typeof MEDIA_LIMITS;

/**
 * POST /api/uploads: reserves a Media row and returns a presigned PUT URL to R2.
 * 413 PAYLOAD_TOO_LARGE above the limit for the type, 415 UNSUPPORTED_MEDIA_TYPE for other types,
 * 402 QUOTA_EXCEEDED when the plan's storage is full.
 */
export const CreateUploadInput = z.object({
  projectId: z.string().min(1),
  fileName: z.string().trim().min(1).max(200),
  // Checked against MEDIA_LIMITS by the handler so the response can be 415 rather than 422.
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});
export type CreateUploadInput = z.infer<typeof CreateUploadInput>;

export type MediaStatus = "PENDING_UPLOAD" | "READY" | "FAILED";

export type Media = {
  id: string;
  projectId: string;
  type: "IMAGE" | "VIDEO";
  mimeType: MediaMimeType;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  status: MediaStatus;
  createdAt: string;
};

export type CreateUploadResponse = {
  media: Media;
  upload: {
    url: string;
    method: "PUT";
    headers: Record<string, string>;
    expiresAt: string;
  };
};

/**
 * PATCH /api/media/{id}: the client confirms the PUT finished and reports what it measured.
 * The server checks the object exists in R2 before marking it READY.
 */
export const UpdateMediaInput = z.object({
  status: z.literal("READY"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationMs: z.number().int().positive().optional(),
});
export type UpdateMediaInput = z.infer<typeof UpdateMediaInput>;
