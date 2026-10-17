import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { marqueeGeometry, marqueeOffset, marqueeTilesAt } from "./layout";

/**
 * Marquee (loop): rows of media scroll sideways at a constant speed, alternating direction.
 * The video is exactly one cycle long, so it loops without a visible seam.
 */
export function Marquee({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const out = { width, height };
  const unit = unitScale(width, height);
  const { tile } = marqueeGeometry(config, out);
  const tiles = marqueeTilesAt(config, out, marqueeOffset(config, out, frame, fps));

  return (
    <Stage config={config} watermark={watermark} endingStart={null}>
      {tiles.map((t) => (
        <MediaFrame
          key={t.key}
          item={t.item}
          frame={tile}
          settings={config.settings}
          unit={unit}
          startFrame={0}
          style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
        />
      ))}
    </Stage>
  );
}
