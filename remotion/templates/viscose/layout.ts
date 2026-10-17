import type { MediaItem, ShowreelConfig } from "../../shared/config";
import { mediaBox, type Box } from "../../shared/dimensions";
import { paramsSchema, type ParamSpecs } from "../../shared/params";

export const VISCOSE_PARAMS = {
  radius: { label: "Jari-jari cincin", min: 0.4, max: 1.1, step: 0.01, default: 0.78 },
  seconds: { label: "Detik per putaran", min: 6, max: 30, step: 0.5, default: 16 },
  cardSize: { label: "Ukuran kartu", min: 0.15, max: 0.45, step: 0.01, default: 0.22 },
  melt: { label: "Lelehan", min: 0, max: 1, step: 0.01, default: 0.6 },
} satisfies ParamSpecs;

export const viscoseParams = paramsSchema(VISCOSE_PARAMS);

export function viscoseCycleFrames(config: ShowreelConfig, fps: number) {
  return Math.max(Math.round(viscoseParams.parse(config.templateParams).seconds * fps), 1);
}

export function viscoseCardBox(config: ShowreelConfig, out: Box): Box {
  const { cardSize } = viscoseParams.parse(config.templateParams);
  const full = mediaBox(out, config.settings.mediaAspectRatio, config.settings.mediaScale);
  return { width: (full.width * cardSize) / 0.78, height: (full.height * cardSize) / 0.78 };
}

export type ViscoseCard = {
  key: string;
  item: MediaItem;
  x: number;
  y: number;
  /** Radius of the liquid blob under this card. */
  blob: number;
  /** The drop hanging below the card: offset from the card center and its radius. */
  drop: { dy: number; r: number };
};

/**
 * Cards spaced on a ring in the screen plane. `phase` runs 0..1 over one loop. Every
 * oscillation uses a whole number of cycles per loop, so phase 1 equals phase 0.
 */
export function viscoseAt(config: ShowreelConfig, out: Box, phase: number): ViscoseCard[] {
  const params = viscoseParams.parse(config.templateParams);
  const box = viscoseCardBox(config, out);
  const n = config.media.length;
  const ringRadius = (Math.min(out.width, out.height) / 2) * params.radius;
  // Blobs reach past the card edges so the liquid shows around every card.
  const base = Math.max(box.width, box.height) * 0.62;
  return config.media.map((item, i) => {
    const angle = 2 * Math.PI * (i / n + phase) - Math.PI / 2;
    // Each card swells and drips on its own beat (2 or 3 beats per loop, offset per card).
    const beat = 2 * Math.PI * ((2 + (i % 2)) * phase + i / n);
    const swell = 1 + 0.08 * Math.sin(beat);
    const drip = (Math.sin(beat - Math.PI / 2) + 1) / 2; // 0..1
    return {
      key: item.id,
      item,
      x: Math.cos(angle) * ringRadius,
      y: Math.sin(angle) * ringRadius,
      blob: base * swell,
      drop: { dy: box.height * (0.45 + 0.35 * drip * params.melt), r: base * (0.22 + 0.2 * params.melt * drip) },
    };
  });
}
