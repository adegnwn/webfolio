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
  durationInFrames: (config: ShowreelConfig, fps: number) => number;
};

/** One template = composition + parameter specs + metadata (PRD 4.1). */
export type TemplateDefinition = TemplateMeta & {
  component: ComponentType<ShowreelProps>;
};
