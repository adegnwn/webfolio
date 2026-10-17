import { describe, expect, it } from "vitest";
import { TEMPLATE_CATALOG } from "@/remotion/catalog";
import { defaultConfig } from "@/remotion/composition";
import { getDimensions } from "@/remotion/shared/dimensions";
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
