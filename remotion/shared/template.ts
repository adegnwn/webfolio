import type { ComponentType } from "react";
import type { ShowreelConfig, ShowreelProps } from "./config";
import type { ParamSpecs } from "./params";

export type TemplateType = "SHOWREEL" | "LOOP";

/**
 * Everything about a template except its React component. Server code (API, seed) only
 * imports this, so it never pulls Remotion components into a server bundle.
 */
export type TemplateMeta = {
  slug: string;
  name: string;
  /** Indonesian, one sentence, shown in the template library. */
  description: string;
  type: TemplateType;
  isPremium: boolean;
  /** ISO date; the library shows "Baru" for 30 days after this. */
  publishedAt: string;
  params: ParamSpecs;
  /** False when the motion has no "rest" moment (e.g. Marquee), so the editor hides that setting. */
  usesHoldDuration: boolean;
  /**
   * Showreels end with the brand ending. Loops have no ending: their last frame must lead
   * straight back into frame 0, so durationInFrames is exactly one motion cycle.
   */
  durationInFrames: (config: ShowreelConfig, fps: number) => number;
};

/** One template = composition + parameter specs + metadata (PRD 4.1). */
export type TemplateDefinition = TemplateMeta & {
  component: ComponentType<ShowreelProps>;
};
