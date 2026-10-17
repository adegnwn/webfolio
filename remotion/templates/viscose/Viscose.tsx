import { useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { viscoseAt, viscoseCardBox, viscoseCycleFrames, viscoseParams } from "./layout";

/**
 * Viscose (loop): the media ride a ring of liquid. A "goo" filter (blur, then a sharp alpha
 * threshold) merges the blobs under the cards into one fluid ring, and each card's drop
 * stretches and pulls back, so the ring looks like it melts card by card.
 */
export function Viscose({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const out = { width, height };
  const unit = unitScale(width, height);
  const params = viscoseParams.parse(config.templateParams);
  const cycle = viscoseCycleFrames(config, fps);
  const box = viscoseCardBox(config, out);
  const cards = viscoseAt(config, out, (frame % cycle) / cycle);
  const filterId = `goo-${useId().replace(/:/g, "")}`;
  const cx = width / 2;
  const cy = height / 2;
  const ringRadius = (Math.min(width, height) / 2) * params.radius;

  return (
    <Stage config={config} watermark={watermark} endingStart={null}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={18 * unit} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} fill={config.settings.textColor}>
          {/* A thin ring between the cards keeps the liquid connected. */}
          <circle cx={cx} cy={cy} r={ringRadius} fill="none" stroke={config.settings.textColor} strokeWidth={22 * unit} />
          {cards.map((c) => (
            <g key={c.key}>
              <circle cx={cx + c.x} cy={cy + c.y} r={c.blob} />
              <circle cx={cx + c.x} cy={cy + c.y + c.drop.dy} r={c.drop.r} />
            </g>
          ))}
        </g>
      </svg>
      {cards.map((c) => (
        <MediaFrame
          key={c.key}
          item={c.item}
          frame={box}
          settings={config.settings}
          unit={unit}
          startFrame={0}
          style={{ transform: `translate(${c.x}px, ${c.y}px)`, zIndex: 1 }}
        />
      ))}
    </Stage>
  );
}
