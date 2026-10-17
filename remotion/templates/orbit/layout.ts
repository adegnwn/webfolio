import type { MediaItem, ShowreelConfig } from "../../shared/config";
import { mediaBox, type Box } from "../../shared/dimensions";
import { paramsSchema, type ParamSpecs } from "../../shared/params";

export const ORBIT_PARAMS = {
  radius: { label: "Jari-jari cincin", min: 0.4, max: 1.3, step: 0.01, default: 0.9 },
  tilt: { label: "Kemiringan cincin", min: 0, max: 45, step: 1, default: 16, unit: "deg" },
  seconds: { label: "Detik per putaran", min: 4, max: 30, step: 0.5, default: 12 },
  cardSize: { label: "Ukuran kartu", min: 0.2, max: 0.6, step: 0.01, default: 0.36 },
} satisfies ParamSpecs;

export const orbitParams = paramsSchema(ORBIT_PARAMS);

export type OrbitCard = { item: MediaItem; x: number; y: number; scale: number; depth: number; key: string };

/** Camera distance as a multiple of the ring radius; smaller means stronger perspective. */
const CAMERA = 3.2;

export function orbitCycleFrames(config: ShowreelConfig, fps: number) {
  return Math.max(Math.round(orbitParams.parse(config.templateParams).seconds * fps), 1);
}

export function orbitCardBox(config: ShowreelConfig, out: Box): Box {
  const { cardSize } = orbitParams.parse(config.templateParams);
  // mediaBox fills ~78% of the frame; cardSize scales that down to a card on the ring.
  const full = mediaBox(out, config.settings.mediaAspectRatio, config.settings.mediaScale);
  return { width: full.width * cardSize / 0.78, height: full.height * cardSize / 0.78 };
}

/**
 * Cards spaced evenly on a horizontal ring, seen from slightly above. `turn` is the ring's
 * rotation in turns (0..1); turn 1 is the same picture as turn 0, which makes the loop seamless.
 */
export function orbitCardsAt(config: ShowreelConfig, out: Box, turn: number): OrbitCard[] {
  const params = orbitParams.parse(config.templateParams);
  const n = config.media.length;
  const box = orbitCardBox(config, out);
  // Side cards (scale 1) sit at ±radius; at radius 1 they just touch the frame edges.
  const radius = Math.max(out.width / 2 - box.width / 2, box.width) * params.radius;
  const tilt = (params.tilt * Math.PI) / 180;
  const camera = radius * CAMERA;
  return config.media.map((item, i) => {
    const angle = 2 * Math.PI * (i / n + turn);
    // Ring in the x/z plane; z > 0 is toward the viewer.
    const x3 = Math.sin(angle) * radius;
    const z3 = Math.cos(angle) * radius;
    // Seen from above: the near side of the ring sits lower on screen, the far side higher.
    const y3 = z3 * Math.sin(tilt);
    const zView = z3 * Math.cos(tilt);
    const scale = camera / (camera - zView);
    return { item, key: item.id, x: x3 * scale, y: y3 * scale, scale, depth: zView / radius };
  });
}
