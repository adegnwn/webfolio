import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { ShowreelProps } from "../../shared/config";
import { parseRatio, unitScale } from "../../shared/dimensions";
import { MediaFrame } from "../../shared/MediaFrame";
import { Stage } from "../../shared/Stage";
import { folioTiming } from "./timing";

const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Folio: a folder opens, the media spill out into a grid, then fan into a single row that
 * scrolls like a marquee before the ending. The folder is drawn in the text color so it
 * follows the user's palette.
 */
export function Folio({ config, watermark }: ShowreelProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { settings, media } = config;
  const unit = unitScale(width, height);
  const n = media.length;
  const ratio = parseRatio(settings.mediaAspectRatio);
  const timing = folioTiming(config, fps);

  // Grid: columns chosen so the grid's shape roughly matches the output's.
  const columns = Math.max(1, Math.ceil(Math.sqrt((n * (width / height)) / ratio)));
  const rows = Math.ceil(n / columns);
  const gap = 0.025 * Math.min(width, height);
  const gridTileW =
    Math.min((width * 0.8 - gap * (columns - 1)) / columns, ((height * 0.78 - gap * (rows - 1)) / rows) * ratio) *
    settings.mediaScale;
  const gridTile = { width: gridTileW, height: gridTileW / ratio };
  const cell = (i: number) => {
    const r = Math.floor(i / columns);
    const c = i % columns;
    const inRow = r === rows - 1 ? n - r * columns : columns; // the last row may be short; center it
    return {
      x: (c - (inRow - 1) / 2) * (gridTile.width + gap),
      y: (r - (rows - 1) / 2) * (gridTile.height + gap),
    };
  };

  // Row: larger cards in one line for the marquee.
  const rowH = Math.min(height * 0.42, (width * 0.55) / ratio) * settings.mediaScale;
  const rowTile = { width: rowH * ratio, height: rowH };
  const pitch = rowTile.width * 1.08;
  const speed = pitch / (0.7 * fps); // px per frame: one card every 0.7 s
  const scroll = Math.max(frame - timing.fanEnd, 0) * speed;

  // Folder: below center, opens toward the viewer, drops away once the media are out.
  const folderW = Math.min(width, height) * 0.46;
  const folderH = folderW * 0.72;
  const folderY = height * 0.08;
  const appear = interpolate(frame, [0, timing.open * 0.5], [0, 1], { ...clamp, easing: easeOut });
  const openAngle = interpolate(frame, [timing.open * 0.35, timing.open], [0, 62], { ...clamp, easing: easeInOut });
  const leave = interpolate(frame, [timing.spillEnd - timing.fly * 0.6, timing.spillEnd], [0, 1], { ...clamp, easing: easeInOut });
  const ink = settings.textColor;
  const folderBox = {
    position: "absolute",
    left: width / 2 - folderW / 2,
    top: height / 2 + folderY - folderH / 2 + leave * height * 0.25,
    width: folderW,
    height: folderH,
    opacity: appear * (1 - leave),
    transform: `scale(${0.9 + 0.1 * appear})`,
  } as const;

  const cards = [];
  for (let i = 0; i < n; i++) {
    const item = media[i];
    const flyStart = timing.spillStart + i * timing.stagger;
    if (frame < flyStart) continue;

    const target = cell(i);
    const fly = interpolate(frame, [flyStart, flyStart + timing.fly], [0, 1], { ...clamp, easing: easeOut });
    // Out of the folder mouth on an upward arc, then into its grid cell.
    let x = target.x * fly;
    let y = folderY + (target.y - folderY) * fly - Math.sin(Math.PI * fly) * height * 0.12;
    let w = gridTile.width * (0.3 + 0.7 * fly);
    let rotate = (1 - fly) * (i % 2 === 0 ? -8 : 8);

    if (frame >= timing.fanStart) {
      const fan = interpolate(frame, [timing.fanStart, timing.fanEnd], [0, 1], { ...clamp, easing: easeInOut });
      const rowX = (i - (n - 1) / 2) * pitch - scroll;
      x = target.x + (rowX - target.x) * fan;
      y = target.y * (1 - fan);
      w = gridTile.width + (rowTile.width - gridTile.width) * fan;
      // Spread like a hand of cards halfway through, flat again in the row.
      rotate = Math.sin(Math.PI * fan) * (i - (n - 1) / 2) * (24 / Math.max(n, 2));
    }
    const scale = w / rowTile.width;
    cards.push(
      <MediaFrame
        key={item.id}
        item={item}
        frame={rowTile}
        settings={settings}
        unit={unit}
        startFrame={flyStart}
        style={{ transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`, zIndex: 2 + i }}
      />,
    );
  }

  // During the marquee, copies of the row follow behind so the line never runs out.
  if (frame >= timing.fanEnd) {
    const reach = width / 2 + rowTile.width;
    for (let k = 1; k <= Math.ceil((width + scroll) / (n * pitch)) + 1; k++) {
      for (let i = 0; i < n; i++) {
        const x = (i + k * n - (n - 1) / 2) * pitch - scroll;
        if (Math.abs(x) > reach) continue;
        const item = media[i];
        cards.push(
          <MediaFrame
            key={`${item.id}-copy-${k}`}
            item={item}
            frame={rowTile}
            settings={settings}
            unit={unit}
            startFrame={timing.fanEnd}
            style={{ transform: `translate(${x}px, 0px)`, zIndex: 2 }}
          />,
        );
      }
    }
  }

  return (
    <Stage config={config} watermark={watermark} endingStart={timing.endingStart}>
      {leave < 1 ? (
        <>
          {/* Back panel with its tab: behind the cards */}
          <div style={{ ...folderBox, zIndex: 1 }}>
            <div style={{ position: "absolute", left: 0, top: -folderH * 0.1, width: folderW * 0.38, height: folderH * 0.2, borderRadius: 10 * unit, background: ink, opacity: 0.22 }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 14 * unit, background: ink, opacity: 0.22 }} />
          </div>
          {/* Front flap, hinged at the bottom: in front of the cards while they leave the folder */}
          <div style={{ ...folderBox, zIndex: 100 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: folderH * 0.82,
                borderRadius: 14 * unit,
                background: ink,
                opacity: 0.34,
                transformOrigin: "50% 100%",
                transform: `perspective(${folderW * 3}px) rotateX(${-openAngle}deg)`,
              }}
            />
          </div>
        </>
      ) : null}
      {cards}
    </Stage>
  );
}
