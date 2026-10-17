import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const STACK_PARAMS = {
  depth: { label: "Jarak antar kartu", min: 0, max: 0.12, step: 0.005, default: 0.045 },
  exitAngle: { label: "Arah kartu keluar", min: 0, max: 360, step: 1, default: 200, unit: "deg" },
  tilt: { label: "Putaran kartu keluar", min: 0, max: 40, step: 1, default: 14, unit: "deg" },
} satisfies ParamSpecs;

export const stackParams = paramsSchema(STACK_PARAMS);

const ENTER_SEC = 0.65;

export function stackTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
