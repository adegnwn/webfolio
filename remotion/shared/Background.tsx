import { AbsoluteFill, Img } from "remotion";
import type { Background as BackgroundValue } from "./config";
import { resolveSrc } from "./media";

export function Background({ value }: { value: BackgroundValue }) {
  switch (value.type) {
    case "color":
      return <AbsoluteFill style={{ backgroundColor: value.color }} />;
    case "gradient":
      return (
        <AbsoluteFill
          style={{ background: `linear-gradient(${value.angle}deg, ${value.from}, ${value.to})` }}
        />
      );
    case "custom":
      return (
        <AbsoluteFill>
          <Img src={resolveSrc(value.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      );
  }
}

/** Color for text that sits on a solid fill of the background, e.g. the brand on an ending. */
export function backgroundInk(value: BackgroundValue) {
  return value.type === "color" ? value.color : "#070708";
}
