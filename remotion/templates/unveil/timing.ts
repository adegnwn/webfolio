import type { ShowreelConfig } from "../../shared/config";
import { choiceParam, paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const UNVEIL_PARAMS = {
  axis: choiceParam("Garis awal", ["Mendatar", "Tegak"], 0),
  fill: { label: "Isi layar", min: 0.5, max: 1, step: 0.01, default: 1 },
  zoom: { label: "Zoom saat membuka", min: 0, max: 0.3, step: 0.01, default: 0.1 },
} satisfies ParamSpecs;

export const unveilParams = paramsSchema(UNVEIL_PARAMS);

const ENTER_SEC = 0.9;

export function unveilTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
