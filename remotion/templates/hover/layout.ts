import type { ShowreelConfig } from "../../shared/config";
import type { Box } from "../../shared/dimensions";
import { fitGrid, gridCells, type GridCell } from "../../shared/grid";
import { choiceParam, paramsSchema, type ParamSpecs } from "../../shared/params";

export const HOVER_PARAMS = {
  rows: { label: "Jumlah baris", min: 1, max: 4, step: 1, default: 2 },
  lift: { label: "Tinggi angkat", min: 0, max: 0.3, step: 0.01, default: 0.14 },
  seconds: { label: "Detik per putaran kursor", min: 4, max: 20, step: 0.5, default: 9 },
  cursor: choiceParam("Kursor", ["Tampil", "Sembunyi"], 0),
} satisfies ParamSpecs;

export const hoverParams = paramsSchema(HOVER_PARAMS);

const GAP = 0.035;

export function hoverCycleFrames(config: ShowreelConfig, fps: number) {
  return Math.max(Math.round(hoverParams.parse(config.templateParams).seconds * fps), 1);
}

export function hoverGrid(config: ShowreelConfig, out: Box) {
  const params = hoverParams.parse(config.templateParams);
  return fitGrid(out, {
    rows: params.rows,
    gapRatio: GAP,
    mediaAspectRatio: config.settings.mediaAspectRatio,
    mediaScale: config.settings.mediaScale,
  });
}

/**
 * Cursor path: a figure eight across the grid (x at 1x, y at 2x the loop frequency), so
 * phase 1 lands exactly on phase 0 and the loop has no seam.
 */
export function cursorAt(grid: ReturnType<typeof hoverGrid>, phase: number) {
  const spanX = ((grid.columns - 1) / 2) * grid.pitch.x + grid.tile.width * 0.25;
  const spanY = ((grid.rows - 1) / 2) * grid.pitch.y + grid.tile.height * 0.25;
  return {
    x: Math.sin(2 * Math.PI * phase) * spanX,
    y: Math.sin(4 * Math.PI * phase) * spanY,
  };
}

/** 0..1: how much a cell is lifted, by its distance to the cursor. */
export function liftFor(cell: GridCell, cursor: { x: number; y: number }, grid: ReturnType<typeof hoverGrid>) {
  const dx = (cell.x - cursor.x) / grid.pitch.x;
  const dy = (cell.y - cursor.y) / grid.pitch.y;
  return Math.exp(-(dx * dx + dy * dy) * 2.2);
}

export function hoverCells(config: ShowreelConfig, out: Box) {
  return gridCells(config.media, hoverGrid(config, out));
}
