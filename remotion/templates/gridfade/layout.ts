// The React-free entry: this file is imported by the catalog, which server routes load.
import { interpolate } from "remotion/no-react";
import type { MediaItem, ShowreelConfig } from "../../shared/config";
import { parseRatio, type Box } from "../../shared/dimensions";
import { paramsSchema, type ParamSpecs } from "../../shared/params";

export const GRIDFADE_PARAMS = {
  rows: { label: "Jumlah baris", min: 1, max: 5, step: 1, default: 3 },
  gap: { label: "Jarak antar media", min: 0, max: 0.1, step: 0.005, default: 0.03 },
  stagger: { label: "Jeda antar media (detik)", min: 0.02, max: 0.3, step: 0.01, default: 0.08 },
  hold: { label: "Lama tampil penuh (detik)", min: 0.5, max: 6, step: 0.1, default: 2 },
} satisfies ParamSpecs;

export const gridFadeParams = paramsSchema(GRIDFADE_PARAMS);

/** Share of the output the grid may cover. */
const FILL = 0.9;
const FADE_SEC = 0.5;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const easeIn = (t: number) => t * t * t;

export type GridTile = { key: string; item: MediaItem; x: number; y: number; order: number };

export function gridGeometry(config: ShowreelConfig, out: Box) {
  const params = gridFadeParams.parse(config.templateParams);
  const rows = Math.round(params.rows);
  const gap = params.gap * Math.min(out.width, out.height);
  const ratio = parseRatio(config.settings.mediaAspectRatio);
  // Rows are chosen; columns fill the width, so wide and tall videos both get a full grid.
  let tileHeight = (out.height * FILL - gap * (rows - 1)) / rows;
  let tileWidth = tileHeight * ratio;
  let columns = Math.floor((out.width * FILL + gap) / (tileWidth + gap));
  if (columns < 1) {
    columns = 1;
    tileWidth = out.width * FILL;
    tileHeight = tileWidth / ratio;
  }
  tileWidth *= config.settings.mediaScale;
  tileHeight *= config.settings.mediaScale;
  return { columns, rows, gap, tile: { width: tileWidth, height: tileHeight } as Box };
}

export function gridTiles(config: ShowreelConfig, out: Box): GridTile[] {
  const { columns, rows, gap, tile } = gridGeometry(config, out);
  const tiles: GridTile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const k = r * columns + c;
      tiles.push({
        key: `${r}:${c}`,
        // Each row starts half the list further on, so the same image rarely sits directly below itself.
        item: config.media[(k + r * Math.floor(config.media.length / 2)) % config.media.length],
        x: (c - (columns - 1) / 2) * (tile.width + gap),
        y: (r - (rows - 1) / 2) * (tile.height + gap),
        // Diagonal wave from the top-left corner.
        order: r + c,
      });
    }
  }
  return tiles;
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
