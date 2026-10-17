import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { revealParams, revealTiming } from "./timing";

const ease = Easing.bezier(0.7, 0, 0.2, 1);

/**
 * Reveal: each item opens through a square or circular mask that grows from the center,
 * while the item itself scales up to rest size. It covers the previous item, which then goes.
 */
export function Reveal({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = revealParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = revealTiming(config, fps);
  const circle = params.shape === 1;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        const start = i * step;
        // Visible from its reveal until the next item has fully covered it.
        const nextCovered = (i + 1) * step + enter;
        if (frame < start || (i < media.length - 1 && frame >= nextCovered)) return null;

        const t = ease(Math.min((frame - start) / enter, 1));
        const clipPath = circle
          ? // Radius reaches the frame's corners at t = 1.
            `circle(${t * 0.5 * Math.hypot(box.width, box.height)}px at 50% 50%)`
          : `inset(${(1 - t) * 50}% round ${settings.borderRadius * unit}px)`;
        const scale = params.startScale + (1 - params.startScale) * t;

        return (
          <MediaFrame
            key={item.id}
            item={item}
            frame={box}
            settings={settings}
            unit={unit}
            startFrame={start}
            style={{ clipPath, transform: `scale(${scale})`, zIndex: i }}
          />
        );
      })}
    </Stage>
  );
}
