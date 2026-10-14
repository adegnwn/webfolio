import type { ShowreelConfig } from "./config";

export const ENDING_SECONDS = { withBrand: 1.9, withoutBrand: 0.9 } as const;

export type StepTiming = {
  /** Frames for an item to travel in. */
  enter: number;
  /** Frames an item rests in the center (holdDuration). */
  hold: number;
  /** Frames between the start of one item and the next. */
  step: number;
};

export function stepTiming(enterSec: number, holdSec: number, fps: number): StepTiming {
  const enter = Math.round(enterSec * fps);
  const hold = Math.round(holdSec * fps);
  return { enter, hold, step: enter + hold };
}

export function endingFrames(config: ShowreelConfig, fps: number) {
  const sec = config.settings.brand ? ENDING_SECONDS.withBrand : ENDING_SECONDS.withoutBrand;
  return Math.round(sec * fps);
}

/**
 * Showreel timeline: items arrive one per step, and the ending starts when the
 * last item has finished holding.
 */
export function showreelDuration(config: ShowreelConfig, timing: StepTiming, fps: number) {
  const itemsEnd = config.media.length * timing.step;
  return { endingStart: itemsEnd, total: itemsEnd + endingFrames(config, fps) };
}
