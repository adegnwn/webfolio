import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { orbitCardBox, orbitCardsAt, orbitCycleFrames } from "./layout";

/**
 * Orbit (loop): the media ride a ring that turns slowly in space. Cards on the far side are
 * smaller, darker and behind; one full turn is one loop.
 */
export function Orbit({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const out = { width, height };
  const unit = unitScale(width, height);
  const cycle = orbitCycleFrames(config, fps);
  const box = orbitCardBox(config, out);
  const cards = orbitCardsAt(config, out, (frame % cycle) / cycle);

  return (
    <Stage config={config} watermark={watermark} endingStart={null}>
      {cards.map((c) => (
        <MediaFrame
          key={c.key}
          item={c.item}
          frame={box}
          settings={config.settings}
          unit={unit}
          startFrame={0}
          // depth -1 (far) .. 1 (near): far cards darken so the ring reads as round.
          dim={Math.max(0, -c.depth) * 0.55}
          style={{
            transform: `translate(${c.x}px, ${c.y}px) scale(${c.scale})`,
            zIndex: Math.round((c.depth + 1) * 1000),
          }}
        />
      ))}
    </Stage>
  );
}
