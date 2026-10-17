import { staticFile } from "remotion";
import type { MediaItem } from "./config";

const EXAMPLE_PREFIX = "example:";

/** Example media live in public/example-media and are referenced as "example:<file>". */
export function isExampleMedia(item: MediaItem) {
  return item.src.startsWith(EXAMPLE_PREFIX);
}

/** Turns a stored src into something a browser or the renderer can load. */
export function resolveSrc(src: string) {
  return src.startsWith(EXAMPLE_PREFIX)
    ? staticFile(`example-media/${src.slice(EXAMPLE_PREFIX.length)}`)
    : src;
}

export const EXAMPLE_MEDIA: MediaItem[] = [
  { id: "example-01", type: "image", src: "example:contoh-01.svg", name: "Contoh media 01", width: 1600, height: 2000 },
  { id: "example-02", type: "image", src: "example:contoh-02.svg", name: "Contoh media 02", width: 1920, height: 1200 },
  { id: "example-03", type: "image", src: "example:contoh-03.svg", name: "Contoh media 03", width: 1600, height: 2000 },
  { id: "example-04", type: "image", src: "example:contoh-04.svg", name: "Contoh media 04", width: 1920, height: 1200 },
  { id: "example-05", type: "image", src: "example:contoh-05.svg", name: "Contoh media 05", width: 1600, height: 2000 },
  { id: "example-06", type: "image", src: "example:contoh-06.svg", name: "Contoh media 06", width: 1600, height: 2000 },
];
