import { z } from "zod";

/**
 * ShowreelConfig is the one document that describes a showreel. The editor preview,
 * the Remotion render, the "Copy JSON" button and POST /api/renders all use this shape.
 * Changes must be additive (new optional fields with defaults) so stored projects keep loading.
 */

export const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:5", "21:9", "4:3", "3:2"] as const;
export const AspectRatio = z.enum(ASPECT_RATIOS);
export type AspectRatio = z.infer<typeof AspectRatio>;

export const RESOLUTIONS = ["720p", "1080p", "2160p"] as const;
export const Resolution = z.enum(RESOLUTIONS);
export type Resolution = z.infer<typeof Resolution>;

// Endings ship one at a time; the enum grows as each one is built (PRD lists six).
export const ENDINGS = ["flood", "wipe"] as const;
export const Ending = z.enum(ENDINGS);
export type Ending = z.infer<typeof Ending>;

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Gunakan format #rrggbb");

export const Background = z.discriminatedUnion("type", [
  z.object({ type: z.literal("color"), color: HexColor }),
  z.object({
    type: z.literal("gradient"),
    from: HexColor,
    to: HexColor,
    angle: z.number().min(0).max(360),
  }),
  z.object({ type: z.literal("custom"), src: z.string().min(1) }),
]);
export type Background = z.infer<typeof Background>;

/** Universal parameters, PRD section 4.2. */
export const UniversalSettings = z.object({
  aspectRatio: AspectRatio.default("4:5"),
  mediaAspectRatio: AspectRatio.default("4:5"),
  mediaFit: z.enum(["crop", "contain"]).default("crop"),
  mediaScale: z.number().min(0.1).max(2).default(1),
  borderRadius: z.number().int().min(0).max(100).default(12),
  background: Background.default({ type: "color", color: "#070708" }),
  textColor: HexColor.default("#f2efe9"),
  brand: z.string().trim().max(40).default(""),
  ending: Ending.default("flood"),
  holdDuration: z.number().min(0).max(10).default(0.4),
  audioVolume: z.number().min(0).max(1).default(0.8),
});
export type UniversalSettings = z.infer<typeof UniversalSettings>;

export const MAX_MEDIA_ITEMS = 30; // PRD risk R1: keeps a render inside the Lambda time limit.

export const MediaItem = z.object({
  id: z.string().min(1),
  type: z.enum(["image", "video"]),
  // Stored projects use "media:<mediaId>" (the server swaps in a signed R2 URL before preview
  // or render) or "example:<file>" for the bundled example media. Renderers receive URLs.
  src: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSec: z.number().positive().optional(),
});
export type MediaItem = z.infer<typeof MediaItem>;

export const AudioTrack = z.object({
  src: z.string().min(1),
  loop: z.boolean().default(true),
});

export const ShowreelConfig = z.object({
  version: z.literal(1),
  templateSlug: z.string().min(1),
  settings: UniversalSettings,
  templateParams: z.record(z.string(), z.number()).default({}),
  media: z.array(MediaItem).min(1).max(MAX_MEDIA_ITEMS),
  audio: AudioTrack.nullable().default(null),
});
export type ShowreelConfig = z.infer<typeof ShowreelConfig>;

/** Props every template composition receives. */
export type ShowreelProps = {
  config: ShowreelConfig;
  resolution: Resolution;
  watermark: boolean;
};
