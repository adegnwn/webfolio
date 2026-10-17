import type { TemplateMeta } from "./shared/template";
import { COMET_PARAMS, cometTiming } from "./templates/comet/timing";
import { MARQUEE_PARAMS, marqueeCycleFrames } from "./templates/marquee/layout";
import { RISE_PARAMS, riseTiming } from "./templates/rise/timing";
import { SLIDE_PARAMS, slideTiming } from "./templates/slide/timing";
import { SNAP_PARAMS, snapTiming } from "./templates/snap/timing";
import { STACK_PARAMS, stackTiming } from "./templates/stack/timing";

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
    usesHoldDuration: true,
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
    usesHoldDuration: true,
    durationInFrames: (config, fps) => riseTiming(config, fps).total,
  },
  {
    slug: "slide",
    name: "Slide",
    description: "Item masuk dari satu sisi, berhenti di tengah, lalu keluar di sisi lain.",
    type: "SHOWREEL",
    isPremium: false,
    publishedAt: "2026-10-17",
    params: SLIDE_PARAMS,
    usesHoldDuration: true,
    durationInFrames: (config, fps) => slideTiming(config, fps).total,
  },
  {
    slug: "snap",
    name: "Snap",
    description: "Setiap gambar muncul dengan pop instan, tanpa fade.",
    type: "SHOWREEL",
    isPremium: false,
    publishedAt: "2026-10-17",
    params: SNAP_PARAMS,
    usesHoldDuration: true,
    durationInFrames: (config, fps) => snapTiming(config, fps).total,
  },
  {
    slug: "stack",
    name: "Stack",
    description: "Tumpukan kartu: kartu depan bergeser keluar untuk membuka kartu berikutnya.",
    type: "SHOWREEL",
    isPremium: false,
    publishedAt: "2026-10-17",
    params: STACK_PARAMS,
    usesHoldDuration: true,
    durationInFrames: (config, fps) => stackTiming(config, fps).total,
  },
  {
    slug: "marquee",
    name: "Marquee",
    description: "Baris media bergulir ke samping tanpa henti, berulang mulus.",
    type: "LOOP",
    isPremium: false,
    publishedAt: "2026-10-17",
    params: MARQUEE_PARAMS,
    usesHoldDuration: false,
    durationInFrames: (config, fps) => marqueeCycleFrames(config, fps),
  },
];

export function getTemplateMeta(slug: string) {
  return TEMPLATE_CATALOG.find((t) => t.slug === slug);
}
