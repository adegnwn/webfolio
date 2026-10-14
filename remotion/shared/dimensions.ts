import type { AspectRatio, Resolution } from "./config";

export const FPS = 30;

const SHORT_SIDE: Record<Resolution, number> = {
  "720p": 720,
  "1080p": 1080,
  "2160p": 2160,
};

export function parseRatio(ratio: AspectRatio): number {
  const [w, h] = ratio.split(":").map(Number);
  return w / h;
}

/** Output size in px. The short side matches the resolution; both sides are even for H.264. */
export function getDimensions(ratio: AspectRatio, resolution: Resolution) {
  const r = parseRatio(ratio);
  const short = SHORT_SIDE[resolution];
  const even = (n: number) => Math.round(n / 2) * 2;
  return r >= 1
    ? { width: even(short * r), height: short }
    : { width: short, height: even(short / r) };
}

/**
 * Everything in a template is designed at a 1080 px short side and multiplied by this,
 * so 720p and 4K renders look identical apart from sharpness.
 */
export function unitScale(width: number, height: number) {
  return Math.min(width, height) / 1080;
}

export type Box = { width: number; height: number };

/** Size of one media frame inside the output, before the template moves it around. */
export function mediaBox(
  out: Box,
  mediaRatio: AspectRatio,
  mediaScale: number,
): Box {
  const ratio = parseRatio(mediaRatio);
  const maxW = out.width * 0.78;
  const maxH = out.height * 0.78;
  const fitsByHeight = maxW / maxH > ratio;
  const height = fitsByHeight ? maxH : maxW / ratio;
  const width = fitsByHeight ? maxH * ratio : maxW;
  return { width: width * mediaScale, height: height * mediaScale };
}

/** For "contain": the media's own rectangle inside the frame, so the radius hugs the media. */
export function containBox(frame: Box, mediaWidth?: number, mediaHeight?: number): Box {
  if (!mediaWidth || !mediaHeight) return frame;
  const r = mediaWidth / mediaHeight;
  return frame.width / frame.height > r
    ? { width: frame.height * r, height: frame.height }
    : { width: frame.width, height: frame.width / r };
}
