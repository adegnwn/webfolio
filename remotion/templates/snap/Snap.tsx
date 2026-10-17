import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { snapParams, snapTiming } from "./timing";

/**
 * Snap: hard cuts. Each item replaces the previous one on the exact frame it appears and
 * pops from slightly small to slightly big to rest size. No fades anywhere.
 */
export function Snap({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = snapParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = snapTiming(config, fps);

  // Only the current item is on screen. After the last one it stays until the ending covers it.
  const index = Math.min(Math.floor(frame / step), media.length - 1);
  const item = media[index];
  const local = frame - index * step;

  // Overshoot lands at 35% of the pop, then settles.
  const peak = Math.max(Math.round(enter * 0.35), 1);
  const scale = interpolate(
    local,
    [0, peak, enter],
    [params.startScale, 1 + params.pop, 1],
    { extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.8, 0.3, 1) },
  );
  // Seeded per item, so the render and every preview show the same angle.
  const tilt = (random(`snap-${item.id}-${index}`) * 2 - 1) * params.tilt;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      <MediaFrame
        key={item.id}
        item={item}
        frame={box}
        settings={settings}
        unit={unit}
        startFrame={index * step}
        style={{ transform: `rotate(${tilt}deg) scale(${scale})` }}
      />
    </Stage>
  );
}
