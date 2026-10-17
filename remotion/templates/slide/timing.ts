import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const SLIDE_PARAMS = {
  direction: { label: "Arah gerak", min: 0, max: 360, step: 1, default: 180, unit: "deg" },
  gap: { label: "Jarak antar media", min: 0, max: 0.6, step: 0.01, default: 0.12 },
  tilt: { label: "Miring saat bergerak", min: 0, max: 20, step: 0.5, default: 6, unit: "deg" },
} satisfies ParamSpecs;

export const slideParams = paramsSchema(SLIDE_PARAMS);

const ENTER_SEC = 0.7;

export function slideTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
