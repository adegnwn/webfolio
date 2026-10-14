import { z } from "zod";
import { PageQuery } from "@/lib/api/pagination";

// Contract only. Implemented in Fase 1 (week 6: export, queue, render).

export const RenderResolution = z.enum(["HD_720", "FHD_1080", "UHD_2160"]);
export const RenderFormat = z.enum(["MP4", "WEBM", "GIF"]);

/**
 * POST /api/renders
 * Header `Idempotency-Key` is required (400 IDEMPOTENCY_KEY_REQUIRED without it). The client
 * makes one key per click on "Render" and reuses it on retries. Same key + same body returns
 * the existing render (200); same key + different body is 422 IDEMPOTENCY_KEY_REUSED.
 * New renders return 202. Plan limits: 403 PLAN_REQUIRED (resolution/format not in plan),
 * 402 QUOTA_EXCEEDED (no quota or credits left, details: { needed, available }).
 */
export const CreateRenderInput = z.object({
  projectId: z.string().min(1),
  resolution: RenderResolution,
  format: RenderFormat.default("MP4"),
});
export type CreateRenderInput = z.infer<typeof CreateRenderInput>;

/** GET /api/renders?projectId= */
export const ListRendersQuery = PageQuery.extend({
  projectId: z.string().min(1).optional(),
});
export type ListRendersQuery = z.infer<typeof ListRendersQuery>;

export type RenderStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

/** GET /api/renders/{id}: the editor polls this every 2 seconds while a render runs (PRD 5.6). */
export type Render = {
  id: string;
  projectId: string;
  status: RenderStatus;
  resolution: z.infer<typeof RenderResolution>;
  format: z.infer<typeof RenderFormat>;
  watermark: boolean;
  /** 0..1 */
  progress: number;
  /** Seconds, shown before and during the render. */
  estimatedSeconds: number | null;
  creditsCharged: number;
  /** Present only when status is DONE and the link has not expired. */
  downloadUrl: string | null;
  expiresAt: string | null;
  error: { code: string; message: string } | null;
  createdAt: string;
  completedAt: string | null;
};
