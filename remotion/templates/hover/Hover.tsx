import { useCurrentFrame, useVideoConfig } from "remotion";
import { backgroundInk } from "../../shared/Background";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { cursorAt, hoverCells, hoverCycleFrames, hoverGrid, hoverParams, liftFor } from "./layout";

/**
 * Hover (loop): a cursor glides over a grid of media; whatever is under it rises toward the
 * viewer and settles back as the cursor moves on.
 */
export function Hover({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const out = { width, height };
  const unit = unitScale(width, height);
  const params = hoverParams.parse(config.templateParams);
  const grid = hoverGrid(config, out);
  const cycle = hoverCycleFrames(config, fps);
  const cursor = cursorAt(grid, (frame % cycle) / cycle);
  const cursorSize = 40 * unit;

  return (
    <Stage config={config} watermark={watermark} endingStart={null}>
      {hoverCells(config, out).map((cell) => {
        const lift = liftFor(cell, cursor, grid);
        const raise = lift * params.lift;
        return (
          <MediaFrame
            key={cell.key}
            item={cell.item}
            frame={grid.tile}
            settings={config.settings}
            unit={unit}
            startFrame={0}
            dim={(1 - lift) * 0.18}
            style={{
              transform: `translate(${cell.x}px, ${cell.y - raise * grid.tile.height * 0.35}px) scale(${1 + raise})`,
              // The shadow marks elevation: only lifted cards cast one.
              boxShadow: `0 ${24 * raise * 4 * unit}px ${48 * raise * 4 * unit}px rgba(0,0,0,${0.45 * lift})`,
              zIndex: Math.round(lift * 100),
            }}
          />
        );
      })}
      {params.cursor === 0 ? (
        <svg
          viewBox="0 0 24 24"
          width={cursorSize}
          height={cursorSize}
          style={{
            position: "absolute",
            left: width / 2 + cursor.x,
            top: height / 2 + cursor.y,
            zIndex: 1000,
            overflow: "visible",
          }}
        >
          <path
            d="M2 2 L2 20 L7.2 15.2 L10.6 22.4 L13.8 21 L10.5 13.9 L17.6 13.9 Z"
            fill={config.settings.textColor}
            stroke={backgroundInk(config.settings.background)}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </Stage>
  );
}
