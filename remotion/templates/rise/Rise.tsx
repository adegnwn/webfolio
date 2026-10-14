import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { riseParams, riseTiming } from "./timing";

/** How many covered items stay visible behind the newest one. */
const VISIBLE_DEPTH = 3;

/**
 * Rise: the first item is the hero in the center. Each new item rises from below and
 * lands on top; the ones underneath step back, lift slightly and darken, like a stack.
 */
export function Rise({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = riseParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = riseTiming(config, fps);

  const damping = 200 - 188 * params.overshoot;
  const progress = media.map((_, i) =>
    spring({
      frame: frame - i * step,
      fps,
      durationInFrames: enter,
      config: { damping, stiffness: 140, mass: 1 },
    }),
  );

  const riseFrom = height / 2 + box.height / 2 + 40 * unit;
  const peek = box.height * params.recede * 0.9;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        const start = i * step;
        if (frame < start) return null;

        // How many items have landed on top of this one (fractional while they rise).
        let depth = 0;
        for (let k = i + 1; k < media.length; k++) depth += Math.min(Math.max(progress[k], 0), 1);
        if (depth > VISIBLE_DEPTH + 0.5) return null;

        const p = progress[i];
        const y = (1 - p) * riseFrom - depth * peek;
        const scale = 1 - params.recede * depth;
        const opacity = interpolate(depth, [VISIBLE_DEPTH - 0.5, VISIBLE_DEPTH + 0.5], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <MediaFrame
            key={item.id}
            item={item}
            frame={box}
            settings={settings}
            unit={unit}
            startFrame={start}
            dim={params.dim * Math.min(depth, 1)}
            style={{
              transform: `translateY(${y}px) scale(${scale})`,
              opacity,
              zIndex: i,
            }}
          />
        );
      })}
    </Stage>
  );
}
