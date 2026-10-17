import type { CSSProperties } from "react";
import { Img, OffthreadVideo, Sequence } from "remotion";
import type { MediaItem, UniversalSettings } from "./config";
import { containBox, type Box } from "./dimensions";
import { resolveSrc } from "./media";

type Props = {
  item: MediaItem;
  frame: Box;
  settings: Pick<UniversalSettings, "mediaFit" | "borderRadius">;
  /** Multiplies the radius so it looks the same at 720p and 4K. */
  unit: number;
  /** Global frame at which this item appears; videos start playing from here. */
  startFrame: number;
  /** Transform and opacity set by the template. The frame is centered before this applies. */
  style?: CSSProperties;
  /** 0..1 dark overlay, used by templates that push items into the background. */
  dim?: number;
  /** Applied to the image or video inside the frame, e.g. a zoom that the frame's mask should not follow. */
  innerStyle?: CSSProperties;
};

export function MediaFrame({ item, frame, settings, unit, startFrame, style, dim = 0, innerStyle }: Props) {
  const box =
    settings.mediaFit === "contain" ? containBox(frame, item.width, item.height) : frame;
  const src = resolveSrc(item.src);
  const fill: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block", ...innerStyle };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: box.width,
        height: box.height,
        marginLeft: -box.width / 2,
        marginTop: -box.height / 2,
        borderRadius: settings.borderRadius * unit,
        overflow: "hidden",
        willChange: "transform",
        ...style,
      }}
    >
      {item.type === "image" ? (
        <Img src={src} style={fill} />
      ) : (
        <Sequence from={startFrame} layout="none">
          <OffthreadVideo src={src} muted style={fill} />
        </Sequence>
      )}
      {dim > 0 ? (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${dim})` }} />
      ) : null}
    </div>
  );
}
