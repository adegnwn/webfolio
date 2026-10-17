import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const SNAP_PARAMS = {
  startScale: { label: "Skala awal", min: 0.5, max: 1, step: 0.01, default: 0.86, unit: "x" },
  pop: { label: "Kekuatan pop", min: 0, max: 0.3, step: 0.01, default: 0.08 },
  tilt: { label: "Miring acak", min: 0, max: 10, step: 0.5, default: 2.5, unit: "deg" },
} satisfies ParamSpecs;

export const snapParams = paramsSchema(SNAP_PARAMS);

// The pop is short on purpose: Snap is a cut, not a transition.
export const POP_SEC = 0.28;

export function snapTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(POP_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
