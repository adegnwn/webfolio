import type { ShowreelConfig } from "../../shared/config";
import { choiceParam, paramsSchema, type ParamSpecs } from "../../shared/params";
import { showreelDuration, stepTiming } from "../../shared/timeline";

export const REVEAL_SHAPES = ["Kotak", "Lingkaran"] as const;

export const REVEAL_PARAMS = {
  shape: choiceParam("Bentuk mask", REVEAL_SHAPES, 1),
  startScale: { label: "Skala awal gambar", min: 0.6, max: 1, step: 0.01, default: 0.86, unit: "x" },
} satisfies ParamSpecs;

export const revealParams = paramsSchema(REVEAL_PARAMS);

const ENTER_SEC = 0.75;

export function revealTiming(config: ShowreelConfig, fps: number) {
  const timing = stepTiming(ENTER_SEC, config.settings.holdDuration, fps);
  const { endingStart, total } = showreelDuration(config, timing, fps);
  return { ...timing, endingStart, total };
}
