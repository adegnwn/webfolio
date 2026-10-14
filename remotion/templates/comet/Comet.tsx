import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { mediaBox, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { cometParams, cometTiming } from "./timing";

const easeArrive = Easing.bezier(0.16, 1, 0.3, 1);
const easeLeave = Easing.bezier(0.6, 0, 0.9, 0.4);

/**
 * Comet: each item swings in on a curve, settles in the center, then launches upward
 * while the next one is already arriving.
 */
export function Comet({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const params = cometParams.parse(config.templateParams);
  const unit = unitScale(width, height);
  const box = mediaBox({ width, height }, settings.mediaAspectRatio, settings.mediaScale);
  const { enter, hold, step, exit, endingStart } = cometTiming(config, fps);

  // Entry point: off-screen along entryAngle (0 = right, 90 = below, 180 = left, 270 = above).
  const angle = (params.entryAngle * Math.PI) / 180;
  const distance = Math.hypot(width, height) / 2 + Math.max(box.width, box.height) / 2;
  const startX = Math.cos(angle) * distance;
  const startY = Math.sin(angle) * distance;
  // Control point: halfway in, pushed sideways to bend the path.
  const bend = params.arcHeight * distance;
  const ctrlX = startX / 2 - Math.sin(angle) * bend;
  const ctrlY = startY / 2 + Math.cos(angle) * bend;
  const tilt = 22 * params.arcHeight * (Math.cos(angle) >= 0 ? -1 : 1);
  const flyDistance = height / 2 + box.height / 2 + 40 * unit;

  return (
    <Stage config={config} watermark={watermark} endingStart={endingStart}>
      {media.map((item, i) => {
        const start = i * step;
        const local = frame - start;
        if (local < 0 || local > enter + hold + exit) return null;

        const t = easeArrive(Math.min(local / enter, 1));
        // Quadratic bezier from (start) through (ctrl) to the center (0,0).
        const inv = 1 - t;
        let x = inv * inv * startX + 2 * inv * t * ctrlX;
        let y = inv * inv * startY + 2 * inv * t * ctrlY;
        let rotate = inv * tilt;
        let scale = 0.8 + 0.2 * t;

        const leaving = local - enter - hold;
        if (leaving > 0) {
          const u = easeLeave(Math.min(leaving / exit, 1));
          x = 0;
          y = -u * flyDistance;
          rotate = -u * tilt * 0.35;
          scale = 1 - 0.08 * u;
        }

        const opacity = interpolate(local, [0, Math.max(enter * 0.25, 1)], [0, 1], {
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
            style={{
              transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
              opacity,
              zIndex: i,
            }}
          />
        );
      })}
    </Stage>
  );
}
