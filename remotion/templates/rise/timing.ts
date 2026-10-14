import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const RISE_PARAMS = {
  recede: { label: "Mundur per lapis", min: 0, max: 0.2, step: 0.005, default: 0.06 },
  dim: { label: "Gelap di belakang", min: 0, max: 0.8, step: 0.01, default: 0.35 },
  overshoot: { label: "Pantulan", min: 0, max: 1, step: 0.01, default: 0.3 },
} satisfies ParamSpecs;

export const riseParams = paramsSchema(RISE_PARAMS);

const ENTER_SEC = 0.75;

export function riseTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
