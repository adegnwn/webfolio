import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { backgroundInk } from "./Background";
import type { UniversalSettings } from "./config";
import { DISPLAY_FONT, useFontReady } from "./fonts";

type Props = {
  settings: UniversalSettings;
  /** Global frame where the ending begins. */
  start: number;
  unit: number;
};

const COVER_SEC = 0.55;
const BRAND_IN_SEC = 0.45;

/**
 * Closes the showreel: a fill in the text color covers the last item, then the brand
 * name (if set) appears on it in the background color.
 */
export function Ending({ settings, start, unit }: Props) {
  const frame = useCurrentFrame() - start;
  const { fps, width, height } = useVideoConfig();
  const cornerRadius = Math.hypot(width, height) / 2;
  useFontReady(600, DISPLAY_FONT);

  if (frame < 0) return null;

  const cover = interpolate(frame, [0, COVER_SEC * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  const fill = settings.textColor;
  const coverStyle =
    settings.ending === "flood"
      ? {
          // Circle from the center; radius reaches the corners at cover = 1.
          clipPath: `circle(${cover * cornerRadius}px at 50% 50%)`,
        }
      : { clipPath: `inset(0 ${(1 - cover) * 100}% 0 0)` };

  const brand = settings.brand;
  const brandStart = COVER_SEC * 0.8 * fps;
  const brandT = interpolate(frame, [brandStart, brandStart + BRAND_IN_SEC * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  // Shrink long names so they always fit in 80% of the width.
  const fontSize = Math.min(120 * unit, (width * 0.8) / Math.max(brand.length * 0.56, 1));

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: fill, ...coverStyle }} />
      {brand ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: backgroundInk(settings.background),
              opacity: brandT,
              transform: `translateY(${(1 - brandT) * 28 * unit}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {brand}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}
