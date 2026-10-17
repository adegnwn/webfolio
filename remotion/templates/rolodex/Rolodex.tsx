import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { rolodexParams, rolodexTiming } from "./timing";

const ease = Easing.bezier(0.65, 0, 0.35, 1);
/** Cards are smaller than a full frame so the neighbours above and below stay in view. */
const CARD = 0.62;
/** Past this angle a card has turned away and is not drawn. */
const MAX_ANGLE = (80 * Math.PI) / 180;

/**
 * Rolodex: the media sit on a vertical drum, seen at an angle. The drum turns one card per
 * step, bringing the next card up to the center. Only the centered card plays its video.
 */
export function Rolodex({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = rolodexParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const full = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const box = { width: full.width * CARD, height: full.height * CARD };
  const { enter, step, endingStart } = rolodexTiming(config, fps);

  const radius = box.height * 1.6;
  const angleStep = (box.height * 1.1) / radius;
  const perspective = Math.max(width, height) * 1.6;

  const stepIndex = Math.floor(frame / step);
  const moving = Math.min((frame - stepIndex * step) / enter, 1);
  const position = stepIndex - 1 + ease(moving);
  const centered = Math.round(position);

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        // Positive angle: still below the center, waiting to come up.
        const angle = (i - position) * angleStep;
        if (Math.abs(angle) > MAX_ANGLE) return null;
        const y = Math.sin(angle) * radius;
        const z = (Math.cos(angle) - 1) * radius;
        return (
          <MediaFrame
            key={item.id}
            item={item}
            frame={box}
            settings={settings}
            unit={unit}
            startFrame={i * step}
            paused={i !== centered}
            dim={Math.min(Math.abs(angle) / MAX_ANGLE, 1) * 0.6}
            style={{
              transform: `perspective(${perspective}px) rotateY(${-params.tilt3D}deg) rotateX(${params.tilt3D * 0.35}deg) translate3d(0, ${y}px, ${z}px) rotateX(${(-angle * 180) / Math.PI}deg)`,
              zIndex: Math.round(1000 + z),
            }}
          />
        );
      })}
    </Stage>
  );
}
