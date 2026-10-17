import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const VFLIP_PARAMS = {
  perspective: { label: "Kedalaman 3D", min: 1, max: 4, step: 0.1, default: 2.2 },
  shading: { label: "Bayangan lipatan", min: 0, max: 0.8, step: 0.01, default: 0.45 },
} satisfies ParamSpecs;

export const vflipParams = paramsSchema(VFLIP_PARAMS);

const ENTER_SEC = 0.7;

export function vflipTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
