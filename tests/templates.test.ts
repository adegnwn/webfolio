import { describe, expect, it } from "vitest";
import { compositionMetadata, defaultConfig } from "@/remotion/composition";
import { ShowreelConfig } from "@/remotion/shared/config";
import { getDimensions } from "@/remotion/shared/dimensions";
import { TEMPLATE_CATALOG } from "@/remotion/catalog";

describe("template registry", () => {
  it.each(TEMPLATE_CATALOG.map((t) => t.slug))("%s has a valid default config", (slug) => {
    const config = defaultConfig(slug);
    expect(ShowreelConfig.safeParse(config).success).toBe(true);
    expect(config.settings).toMatchObject({ aspectRatio: "4:5", holdDuration: 0.4, background: { color: "#070708" } });
  });

  it("gets longer when items hold longer", () => {
    const config = defaultConfig("comet");
    const base = compositionMetadata({ config, resolution: "1080p" }).durationInFrames;
    config.settings.holdDuration = 1.4;
    const longer = compositionMetadata({ config, resolution: "1080p" }).durationInFrames;
    expect(longer - base).toBe(config.media.length * 30);
  });
});

describe("output dimensions", () => {
  it.each([
    ["16:9", "1080p", 1920, 1080],
    ["9:16", "1080p", 1080, 1920],
    ["4:5", "1080p", 1080, 1350],
    ["1:1", "720p", 720, 720],
    ["16:9", "2160p", 3840, 2160],
  ] as const)("%s at %s is %ix%i", (ratio, res, w, h) => {
    expect(getDimensions(ratio, res)).toEqual({ width: w, height: h });
  });
});
