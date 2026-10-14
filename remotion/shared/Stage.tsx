import type { ReactNode } from "react";
import { AbsoluteFill, Audio, useVideoConfig } from "remotion";
import { Background } from "./Background";
import type { ShowreelConfig } from "./config";
import { unitScale } from "./dimensions";
import { Ending } from "./Ending";
import { UI_FONT } from "./fonts";
import { resolveSrc } from "./media";

type Props = {
  config: ShowreelConfig;
  watermark: boolean;
  /** Frame where the ending starts; null for loop templates, which have no ending. */
  endingStart: number | null;
  children: ReactNode;
};

/** Everything a template shares: background, audio, ending and the free-plan watermark. */
export function Stage({ config, watermark, endingStart, children }: Props) {
  const { width, height } = useVideoConfig();
  const unit = unitScale(width, height);
  const { settings } = config;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background value={settings.background} />
      {/* isolate: the templates' per-item zIndex must stay below the ending and watermark */}
      <AbsoluteFill style={{ isolation: "isolate" }}>{children}</AbsoluteFill>
      {endingStart !== null ? <Ending settings={settings} start={endingStart} unit={unit} /> : null}
      {config.audio ? (
        <Audio src={resolveSrc(config.audio.src)} volume={settings.audioVolume} loop={config.audio.loop} />
      ) : null}
      {watermark ? (
        <div
          style={{
            position: "absolute",
            right: 28 * unit,
            bottom: 24 * unit,
            fontFamily: UI_FONT,
            fontWeight: 600,
            fontSize: 22 * unit,
            color: settings.textColor,
            opacity: 0.75,
            mixBlendMode: "difference",
          }}
        >
          Dibuat dengan ShowForge
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
