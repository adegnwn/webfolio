import type { ShowreelConfig } from "../../shared/config";
import { paramsSchema, type ParamSpecs } from "../../shared/params";
import { endingFrames } from "../../shared/timeline";

export const FOLIO_PARAMS = {
  spill: { label: "Jeda tumpahan (detik)", min: 0.03, max: 0.3, step: 0.01, default: 0.09 },
  gridHold: { label: "Lama grid tampil (detik)", min: 0.5, max: 4, step: 0.1, default: 1.4 },
  marquee: { label: "Lama marquee (detik)", min: 1, max: 8, step: 0.5, default: 3.5 },
} satisfies ParamSpecs;

export const folioParams = paramsSchema(FOLIO_PARAMS);

const OPEN_SEC = 0.8;
const FLY_SEC = 0.75;
const FAN_SEC = 1;

/** Phase boundaries in frames: open folder, spill into grid, hold, fan into a row, scroll, ending. */
export function folioTiming(config: ShowreelConfig, fps: number) {
  const params = folioParams.parse(config.templateParams);
  const n = config.media.length;
  const open = Math.round(OPEN_SEC * fps);
  const fly = Math.round(FLY_SEC * fps);
  const stagger = Math.round(params.spill * fps);
  const spillStart = Math.round(open * 0.75);
  const spillEnd = spillStart + (n - 1) * stagger + fly;
  const fanStart = spillEnd + Math.round(params.gridHold * fps);
  const fanEnd = fanStart + Math.round(FAN_SEC * fps);
  const endingStart = fanEnd + Math.round(params.marquee * fps);
  return { open, fly, stagger, spillStart, spillEnd, fanStart, fanEnd, endingStart, total: endingStart + endingFrames(config, fps) };
}
