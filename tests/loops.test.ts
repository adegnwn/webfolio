import { describe, expect, it } from "vitest";
import { TEMPLATE_CATALOG } from "@/remotion/catalog";
import { defaultConfig } from "@/remotion/composition";
import { getDimensions } from "@/remotion/shared/dimensions";
import { cursorAt, hoverCells, hoverGrid, liftFor } from "@/remotion/templates/hover/layout";
import { orbitCardsAt } from "@/remotion/templates/orbit/layout";
import { viscoseAt } from "@/remotion/templates/viscose/layout";
import { gridTiles, gridTiming, tileProgress } from "@/remotion/templates/gridfade/layout";
import { revealParams } from "@/remotion/templates/reveal/timing";
import { marqueeCycleFrames, marqueeGeometry, marqueeOffset, marqueeTilesAt } from "@/remotion/templates/marquee/layout";

const snapshot = (tiles: ReturnType<typeof marqueeTilesAt>) =>
  tiles.map((t) => `${t.item.id}@${t.x.toFixed(3)},${t.y.toFixed(3)}`).sort();

describe("loop templates", () => {
  it("never use the hold setting or ending", () => {
    for (const t of TEMPLATE_CATALOG.filter((x) => x.type === "LOOP")) {
      expect(t.usesHoldDuration).toBe(false);
    }
  });
});

describe("Marquee", () => {
  it.each(["16:9", "9:16", "4:5", "1:1"] as const)("is seamless at %s: the frame after the last equals frame 0", (ratio) => {
    const config = defaultConfig("marquee");
    config.settings.aspectRatio = ratio;
    const out = getDimensions(ratio, "1080p");
    const { stripLength } = marqueeGeometry(config, out);
    // One full cycle moves every row by exactly one strip length.
    expect(snapshot(marqueeTilesAt(config, out, stripLength))).toEqual(snapshot(marqueeTilesAt(config, out, 0)));
  });

  it("fills the full width at every point in the cycle", () => {
    const config = defaultConfig("marquee");
    const out = getDimensions("16:9", "1080p");
    const { tile } = marqueeGeometry(config, out);
    const cycle = marqueeCycleFrames(config, 30);
    for (let f = 0; f < cycle; f += 7) {
      const xs = marqueeTilesAt(config, out, marqueeOffset(config, out, f, 30)).map((t) => t.x);
      expect(Math.min(...xs) - tile.width / 2).toBeLessThanOrEqual(-out.width / 2);
      expect(Math.max(...xs) + tile.width / 2).toBeGreaterThanOrEqual(out.width / 2);
    }
  });

  it("cycle length follows the speed setting", () => {
    const config = defaultConfig("marquee");
    config.templateParams.speed = 1;
    expect(marqueeCycleFrames(config, 30)).toBe(config.media.length * 30);
  });
});

describe("Grid Fade", () => {
  it.each(["16:9", "9:16", "4:5", "1:1"] as const)("starts and ends on an empty grid at %s, and fills it in between", (ratio) => {
    const config = defaultConfig("gridfade");
    config.settings.aspectRatio = ratio;
    const out = getDimensions(ratio, "1080p");
    const timing = gridTiming(config, out, 30);
    const tiles = gridTiles(config, out);
    expect(tiles.length).toBeGreaterThan(0);
    for (const t of tiles) {
      expect(tileProgress(0, t.order, timing)).toBe(0);
      expect(tileProgress(timing.cycle - 1, t.order, timing)).toBe(0);
      // Middle of the hold: every tile fully shown.
      expect(tileProgress(timing.wave + Math.floor(timing.hold / 2), t.order, timing)).toBe(1);
    }
  });
});

describe("choice params", () => {
  it("accept option indexes only", () => {
    expect(revealParams.safeParse({ shape: 0 }).success).toBe(true);
    expect(revealParams.safeParse({ shape: 0.5 }).success).toBe(false);
    expect(revealParams.safeParse({ shape: 2 }).success).toBe(false);
  });
});

const RATIOS = ["16:9", "9:16", "4:5", "1:1"] as const;
const round = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? Number(v.toFixed(4)) : v));

describe("Orbit, Viscose and Hover loop without a seam", () => {
  it.each(RATIOS)("Orbit at %s: a full turn returns every card to its start", (ratio) => {
    const config = defaultConfig("orbit");
    const out = getDimensions(ratio, "1080p");
    expect(round(orbitCardsAt(config, out, 1))).toBe(round(orbitCardsAt(config, out, 0)));
  });

  it("Orbit keeps near cards in front of far ones", () => {
    const cards = orbitCardsAt(defaultConfig("orbit"), getDimensions("16:9", "1080p"), 0);
    const near = cards.reduce((a, b) => (a.depth > b.depth ? a : b));
    const far = cards.reduce((a, b) => (a.depth < b.depth ? a : b));
    expect(near.scale).toBeGreaterThan(far.scale);
  });

  it.each(RATIOS)("Viscose at %s: phase 1 equals phase 0", (ratio) => {
    const config = defaultConfig("viscose");
    const out = getDimensions(ratio, "1080p");
    expect(round(viscoseAt(config, out, 1))).toBe(round(viscoseAt(config, out, 0)));
  });

  it.each(RATIOS)("Hover at %s: cursor and lifts at phase 1 equal phase 0", (ratio) => {
    const config = defaultConfig("hover");
    const out = getDimensions(ratio, "1080p");
    const grid = hoverGrid(config, out);
    const lifts = (phase: number) => hoverCells(config, out).map((c) => liftFor(c, cursorAt(grid, phase), grid));
    expect(round(cursorAt(grid, 1))).toBe(round(cursorAt(grid, 0)));
    expect(round(lifts(1))).toBe(round(lifts(0)));
  });
});
