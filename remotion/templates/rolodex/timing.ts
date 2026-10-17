import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

// Names and defaults from PRD 4.3.
export const ROLODEX_PARAMS = {
  tilt3D: { label: "Tilt 3D", min: 0, max: 45, step: 1, default: 15, unit: "deg" },
  scrollSpeed: { label: "Kecepatan gulir", min: 0.5, max: 2, step: 0.05, default: 1, unit: "x" },
} satisfies ParamSpecs;

export const rolodexParams = paramsSchema(ROLODEX_PARAMS);

const ENTER_SEC = 0.8;

export function rolodexTiming(config: ShowreelConfig, fps: number) {
  const { scrollSpeed } = rolodexParams.parse(config.templateParams);
  const timing = stepTiming(ENTER_SEC / scrollSpeed, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
