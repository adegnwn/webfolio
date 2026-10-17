import type { MediaItem, ShowreelConfig } from "../../shared/config";
import { parseRatio, type Box } from "../../shared/dimensions";
import { paramsSchema, type ParamSpecs } from "../../shared/params";

export const MARQUEE_PARAMS = {
  rows: { label: "Jumlah baris", min: 1, max: 4, step: 1, default: 2 },
  speed: { label: "Kecepatan (media per detik)", min: 0.2, max: 2, step: 0.05, default: 0.5 },
  gap: { label: "Jarak antar media", min: 0, max: 0.2, step: 0.005, default: 0.04 },
} satisfies ParamSpecs;

export const marqueeParams = paramsSchema(MARQUEE_PARAMS);

/** Share of the output height the rows may fill. */
const FILL = 0.86;

export type MarqueeTile = {
  key: string;
  item: MediaItem;
  /** Center position relative to the output's center, in px. */
  x: number;
  y: number;
};

/** One full cycle: every row moves exactly one strip length, so the last frame flows into frame 0. */
export function marqueeCycleFrames(config: ShowreelConfig, fps: number) {
  const { speed } = marqueeParams.parse(config.templateParams);
  return Math.max(Math.round((config.media.length / speed) * fps), 1);
}

export function marqueeGeometry(config: ShowreelConfig, out: Box) {
  const params = marqueeParams.parse(config.templateParams);
  const rows = Math.round(params.rows);
  const gap = params.gap * Math.min(out.width, out.height);
  const rowHeight = (out.height * FILL - gap * (rows - 1)) / rows;
  const tileHeight = rowHeight * config.settings.mediaScale;
  const tile: Box = { width: tileHeight * parseRatio(config.settings.mediaAspectRatio), height: tileHeight };
  const pitch = tile.width + gap;
  return { rows, gap, rowHeight, tile, pitch, stripLength: pitch * config.media.length };
}

/**
 * Tiles on screen when the strips have moved `offset` px. Rows alternate direction and each
 * row starts at a different item, so the same media never line up vertically.
 */
export function marqueeTilesAt(config: ShowreelConfig, out: Box, offset: number): MarqueeTile[] {
  const { rows, gap, rowHeight, tile, pitch, stripLength } = marqueeGeometry(config, out);
  const n = config.media.length;
  const reach = out.width / 2 + tile.width / 2;
  const copies = Math.ceil((reach + stripLength / 2) / stripLength) + 1;
  const tiles: MarqueeTile[] = [];

  for (let r = 0; r < rows; r++) {
    const y = (r - (rows - 1) / 2) * (rowHeight + gap);
    const direction = r % 2 === 0 ? -1 : 1;
    const shift = Math.floor((r * n) / rows);
    for (let c = -copies; c <= copies; c++) {
      for (let j = 0; j < n; j++) {
        const base = j * pitch - stripLength / 2 + pitch / 2 + c * stripLength;
        const x = base + direction * offset;
        if (Math.abs(x) > reach) continue;
        const item = config.media[(j + shift) % n];
        tiles.push({ key: `${r}:${c}:${j}`, item, x, y });
      }
    }
  }
  return tiles;
}

export function marqueeOffset(config: ShowreelConfig, out: Box, frame: number, fps: number) {
  const cycle = marqueeCycleFrames(config, fps);
  const { stripLength } = marqueeGeometry(config, out);
  return ((frame % cycle) / cycle) * stripLength;
}
