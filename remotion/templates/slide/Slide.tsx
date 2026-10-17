import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { slideParams, slideTiming } from "./timing";

const ease = Easing.bezier(0.65, 0, 0.35, 1);

/**
 * Slide: all items sit on one track. Each step moves the track by one item, so the current
 * item leaves on one side while the next arrives from the other and stops in the center.
 */
export function Slide({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = slideParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = slideTiming(config, fps);

  // Direction of travel (0 = to the right, 180 = to the left, 90 = down).
  const angle = (params.direction * Math.PI) / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  // Distance between item centers: the item's extent along the track plus the gap.
  const extent = Math.abs(dx) * box.width + Math.abs(dy) * box.height;
  const spacing = extent + params.gap * Math.min(width, height);
  // Half the output's extent along the track plus half an item: past this an item is off-screen.
  const visibleLimit = (Math.abs(dx) * width + Math.abs(dy) * height) / 2 + extent / 2;

  // Track position in items: -1 before the first arrives, i while item i holds.
  const stepIndex = Math.floor(frame / step);
  const inStep = frame - stepIndex * step;
  const moving = Math.min(inStep / enter, 1);
  const position = stepIndex - 1 + ease(moving);
  // Tilt peaks mid-move and is zero while an item holds.
  const tilt = Math.sin(Math.PI * moving) * params.tilt * (dx >= 0 ? 1 : -1);

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        // Items further along the list are further "upstream", against the direction of travel.
        const offset = (position - i) * spacing;
        if (Math.abs(offset) > visibleLimit) return null;
        return (
          <MediaFrame
            key={item.id}
            item={item}
            frame={box}
            settings={settings}
            unit={unit}
            startFrame={i * step}
            style={{
              transform: `translate(${offset * dx}px, ${offset * dy}px) rotate(${tilt}deg)`,
            }}
          />
        );
      })}
    </Stage>
  );
}
