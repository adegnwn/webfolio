import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { unveilParams, unveilTiming } from "./timing";

const ease = Easing.bezier(0.83, 0, 0.17, 1);
/** A hairline is visible from the first frame, so the opening reads as a line splitting open. */
const LINE = 0.006;

/**
 * Unveil: each item starts as a thin line across the middle and opens outward until it fills
 * the screen. The frame takes the output's shape, so media are cropped to fit (mediaAspectRatio
 * does not apply here); "Isi layar" below 1 leaves a margin.
 */
export function Unveil({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = unveilParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = { width: width * params.fill, height: height * params.fill };
  const { enter, step, endingStart } = unveilTiming(config, fps);
  const horizontalLine = params.axis === 0;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        const start = i * step;
        const nextCovered = (i + 1) * step + enter;
        if (frame < start || (i < media.length - 1 && frame >= nextCovered)) return null;

        const t = Math.max(ease(Math.min((frame - start) / enter, 1)), LINE);
        const edge = (1 - t) * 50;
        const clipPath = horizontalLine ? `inset(${edge}% 0 ${edge}% 0)` : `inset(0 ${edge}% 0 ${edge}%)`;
        const scale = 1 + params.zoom * (1 - t);

        return (
          <MediaFrame
            key={item.id}
            item={item}
            frame={box}
            settings={{ ...settings, mediaFit: "crop" }}
            unit={unit}
            startFrame={start}
            style={{ clipPath, zIndex: i }}
            innerStyle={{ transform: `scale(${scale})` }}
          />
        );
      })}
    </Stage>
  );
}
