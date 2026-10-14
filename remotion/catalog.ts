import type { TemplateMeta } from "./shared/template";
import { COMET_PARAMS, cometTiming } from "./templates/comet/timing";
import { RISE_PARAMS, riseTiming } from "./templates/rise/timing";

/**
 * Source of truth for which templates exist. The Template table is seeded from this list
 * (prisma/seed.ts), each slug is the Remotion composition id, and registry.ts attaches the
 * React components. No React imports here.
 */
export const TEMPLATE_CATALOG: TemplateMeta[] = [
  {
    slug: "comet",
    name: "Comet",
    description: "Setiap item melengkung masuk, berhenti di tengah, lalu terbang ke atas.",
    type: "SHOWREEL",
    isPremium: false,
    publishedAt: "2026-10-14",
    params: COMET_PARAMS,
    durationInFrames: (config, fps) => cometTiming(config, fps).total,
  },
  {
    slug: "rise",
    name: "Rise",
    description: "Hero tetap di tengah, setiap gambar baru naik dari bawah.",
    type: "SHOWREEL",
    isPremium: false,
    publishedAt: "2026-10-14",
    params: RISE_PARAMS,
    durationInFrames: (config, fps) => riseTiming(config, fps).total,
  },
];

export function getTemplateMeta(slug: string) {
  return TEMPLATE_CATALOG.find((t) => t.slug === slug);
}
