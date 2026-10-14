import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const COMET_PARAMS = {
  arcHeight: { label: "Tinggi lengkung", min: 0, max: 1, step: 0.01, default: 0.5 },
  entryAngle: { label: "Arah masuk", min: 0, max: 360, step: 1, default: 150, unit: "deg" },
} satisfies ParamSpecs;

export const cometParams = paramsSchema(COMET_PARAMS);

const ENTER_SEC = 0.8;
const EXIT_SEC = 0.6;

export function cometTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, exit: Math.round(EXIT_SEC * fps), endingStart, total };
}
