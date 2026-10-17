import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { stackParams, stackTiming } from "./timing";

/** Cards visible behind the front one. */
const VISIBLE_BEHIND = 3;
/** Each card further back is this much smaller. */
const SHRINK_PER_CARD = 0.05;

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Stack: the media form a deck. On every step the front card slides away, and the cards
 * behind it move up one place, so the next one becomes the front card.
 */
export function Stack({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = stackParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, step, endingStart } = stackTiming(config, fps);

  // Step 0 brings the whole deck in from below; step k > 0 removes card k - 1.
  const stepIndex = Math.floor(frame / step);
  const moving = Math.min((frame - stepIndex * step) / enter, 1);
  const front = stepIndex === 0 ? 0 : stepIndex - 1 + ease(moving);
  const deckRise = stepIndex === 0 ? (1 - easeOut(moving)) * (height / 2 + box.height) : 0;

  const angle = (params.exitAngle * Math.PI) / 180;
  const exitDistance = Math.hypot(width, height) / 2 + Math.max(box.width, box.height);
  const spin = Math.cos(angle) >= 0 ? 1 : -1;
  // Cards behind sit lower so their top edges show above the front card.
  const offsetPerCard = box.height * params.depth;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        // 0 = front card, 1 = the one behind it, negative = on its way out.
        const place = i - front;
        if (place <= -1 || place > VISIBLE_BEHIND + 0.5) return null;

        let transform: string;
        if (place < 0) {
          const u = -place;
          transform = `translate(${Math.cos(angle) * exitDistance * u}px, ${Math.sin(angle) * exitDistance * u}px) rotate(${spin * params.tilt * u}deg)`;
        } else {
          transform = `translateY(${deckRise - place * offsetPerCard}px) scale(${1 - place * SHRINK_PER_CARD})`;
        }
        const opacity = interpolate(place, [VISIBLE_BEHIND - 0.5, VISIBLE_BEHIND + 0.5], [1, 0], {
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
            startFrame={i * step}
            dim={Math.min(Math.max(place, 0), 1) * 0.25}
            style={{ transform, opacity, zIndex: media.length - i }}
          />
        );
      })}
    </Stage>
  );
}
