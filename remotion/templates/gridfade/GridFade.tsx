import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { gridGeometry, gridTiles, gridTiming, tileProgress } from "./layout";

/**
 * Grid Fade (loop): the media fill a grid, tile by tile in a diagonal wave, hold, then leave
 * in the same wave. The video is one wave in and out, so it loops from empty grid to empty grid.
 */
export function GridFade({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const out = { width, height };
  const unit = unitScale(width, height);
  const { tile } = gridGeometry(config, out);
  const timing = gridTiming(config, out, fps);

  return (
    <Stage config={config} watermark={watermark} endingStart={null}>
      {gridTiles(config, out).map((t) => {
        const p = tileProgress(frame, t.order, timing);
        if (p <= 0) return null;
        return (
          <MediaFrame
            key={t.key}
            item={t.item}
            frame={tile}
            settings={config.settings}
            unit={unit}
            startFrame={0}
            style={{
              opacity: p,
              transform: `translate(${t.x}px, ${t.y + (1 - p) * 16 * unit}px) scale(${0.96 + 0.04 * p})`,
            }}
          />
        );
      })}
    </Stage>
  );
}
