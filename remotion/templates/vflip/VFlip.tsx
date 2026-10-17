import type { CSSProperties } from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import type { MediaItem, ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { vflipParams, vflipTiming } from "./timing";

const TOP: CSSProperties = { clipPath: "inset(0 0 50% 0)" };
const BOTTOM: CSSProperties = { clipPath: "inset(50% 0 0 0)" };
const fall = Easing.in(Easing.cubic);
// No overshoot: a bounce lifts the flap and shows a sliver of the old image underneath.
const land = Easing.out(Easing.cubic);

/**
 * VFlip: a split-flap page turn. The top half of the current item folds down over the middle
 * line, and the bottom half of the next item follows it down and lands flat.
 * Both halves hinge on the frame's horizontal center line.
 */
export function VFlip({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = vflipParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = vflipTiming(config, fps);

  const index = Math.min(Math.floor(frame / step), media.length - 1);
  const local = frame - index * step;
  const next = media[index];
  const prev: MediaItem | undefined = media[index - 1];
  const depth = box.height * params.perspective;

  const layer = (item: MediaItem, key: string, start: number, style: CSSProperties, dim = 0, z = 0) => (
    <MediaFrame
      key={key}
      item={item}
      frame={box}
      settings={settings}
      unit={unit}
      startFrame={start}
      dim={dim}
      style={{ ...style, zIndex: z }}
    />
  );

  // At rest: the whole item, no halves.
  if (local >= enter) {
    return (
      <Stage config={config} watermark={watermark} endingStart={endingStart}>
        {layer(next, `${next.id}-rest`, index * step, {})}
      </Stage>
    );
  }

  const t = local / enter;
  const layers = [
    // Underneath: the next item's top half and the current item's bottom half.
    layer(next, `${next.id}-top`, index * step, TOP, 0, 1),
  ];
  // The old bottom half only needs to show until the falling flap has nearly covered it.
  const flapCovered = t >= 0.5 && land((t - 0.5) / 0.5) > 0.97;
  if (prev && !flapCovered) layers.push(layer(prev, `${prev.id}-bottom`, (index - 1) * step, BOTTOM, 0, 1));

  if (t < 0.5) {
    // Current item's top half folds toward the viewer until it stands edge-on.
    const u = fall(t / 0.5);
    if (prev) {
      layers.push(
        layer(
          prev,
          `${prev.id}-flap`,
          (index - 1) * step,
          { ...TOP, transform: `perspective(${depth}px) rotateX(${-90 * u}deg)` },
          params.shading * u,
          2,
        ),
      );
    }
  } else {
    // Next item's bottom half continues the motion from edge-on to flat.
    const u = land((t - 0.5) / 0.5);
    layers.push(
      layer(
        next,
        `${next.id}-flap`,
        index * step,
        { ...BOTTOM, transform: `perspective(${depth}px) rotateX(${90 * (1 - u)}deg)` },
        params.shading * (1 - u),
        2,
      ),
    );
  }

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {layers}
    </Stage>
  );
}
