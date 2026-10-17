import type { AspectRatio, MediaItem } from "./config";
import { parseRatio, type Box } from "./dimensions";

/** Share of the output a grid may cover. */
const FILL = 0.9;

export type GridCell = { key: string; row: number; column: number; x: number; y: number; item: MediaItem };

/**
 * Rows are chosen; columns fill the width, so wide and tall videos both get a full grid.
 * Positions are cell centers relative to the output's center.
 */
export function fitGrid(
  out: Box,
  options: { rows: number; gapRatio: number; mediaAspectRatio: AspectRatio; mediaScale: number },
) {
  const rows = Math.max(Math.round(options.rows), 1);
  const gap = options.gapRatio * Math.min(out.width, out.height);
  const ratio = parseRatio(options.mediaAspectRatio);
  let tileHeight = (out.height * FILL - gap * (rows - 1)) / rows;
  let tileWidth = tileHeight * ratio;
  let columns = Math.floor((out.width * FILL + gap) / (tileWidth + gap));
  if (columns < 1) {
    columns = 1;
    tileWidth = out.width * FILL;
    tileHeight = tileWidth / ratio;
  }
  const tile: Box = { width: tileWidth * options.mediaScale, height: tileHeight * options.mediaScale };
  return { rows, columns, gap, tile, pitch: { x: tileWidth + gap, y: tileHeight + gap } };
}

/** Fills the grid with media. Each row starts half the list further on, so the same image rarely sits directly below itself. */
export function gridCells(media: MediaItem[], grid: ReturnType<typeof fitGrid>): GridCell[] {
  const cells: GridCell[] = [];
  const shift = Math.floor(media.length / 2);
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.columns; c++) {
      cells.push({
        key: `${r}:${c}`,
        row: r,
        column: c,
        x: (c - (grid.columns - 1) / 2) * grid.pitch.x,
        y: (r - (grid.rows - 1) / 2) * grid.pitch.y,
        item: media[(r * grid.columns + c + r * shift) % media.length],
      });
    }
  }
  return cells;
}
