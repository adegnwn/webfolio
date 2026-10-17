// The React-free entry: this file is imported by the catalog, which server routes load.
import { interpolate } from "remotion/no-react";
import type { MediaItem, ShowreelConfig } from "../../shared/config";
import type { Box } from "../../shared/dimensions";
import { fitGrid, gridCells } from "../../shared/grid";
import { paramsSchema, type ParamSpecs } from "../../shared/params";

export const GRIDFADE_PARAMS = {
  rows: { label: "Jumlah baris", min: 1, max: 5, step: 1, default: 3 },
  gap: { label: "Jarak antar media", min: 0, max: 0.1, step: 0.005, default: 0.03 },
  stagger: { label: "Jeda antar media (detik)", min: 0.02, max: 0.3, step: 0.01, default: 0.08 },
  hold: { label: "Lama tampil penuh (detik)", min: 0.5, max: 6, step: 0.1, default: 2 },
} satisfies ParamSpecs;

export const gridFadeParams = paramsSchema(GRIDFADE_PARAMS);

const FADE_SEC = 0.5;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const easeIn = (t: number) => t * t * t;

export type GridTile = { key: string; item: MediaItem; x: number; y: number; order: number };

export function gridGeometry(config: ShowreelConfig, out: Box) {
  const params = gridFadeParams.parse(config.templateParams);
  return fitGrid(out, {
    rows: params.rows,
    gapRatio: params.gap,
    mediaAspectRatio: config.settings.mediaAspectRatio,
    mediaScale: config.settings.mediaScale,
  });
}

export function gridTiles(config: ShowreelConfig, out: Box): GridTile[] {
  // Diagonal wave from the top-left corner.
  return gridCells(config.media, gridGeometry(config, out)).map((c) => ({ ...c, order: c.row + c.column }));
}

/** Frames for fade-in wave, hold, fade-out wave. The loop starts and ends on an empty grid. */
export function gridTiming(config: ShowreelConfig, out: Box, fps: number) {
  const params = gridFadeParams.parse(config.templateParams);
  const { columns, rows } = gridGeometry(config, out);
  const fade = Math.round(FADE_SEC * fps);
  const stagger = Math.max(Math.round(params.stagger * fps), 1);
  const wave = (columns + rows - 2) * stagger + fade;
  const hold = Math.round(params.hold * fps);
  // +1: the last tile finishes fading on the final frame, so it matches the empty frame 0.
  return { fade, stagger, wave, hold, cycle: wave + hold + wave + 1 };
}

/** 0 = hidden, 1 = fully shown, for a tile at a given frame of the cycle. */
export function tileProgress(frame: number, order: number, timing: ReturnType<typeof gridTiming>) {
  const f = frame % timing.cycle;
  const inStart = order * timing.stagger;
  const outStart = timing.wave + timing.hold + order * timing.stagger;
  if (f < outStart) {
    return interpolate(f, [inStart, inStart + timing.fade], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    });
  }
  return interpolate(f, [outStart, outStart + timing.fade], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeIn,
  });
}
