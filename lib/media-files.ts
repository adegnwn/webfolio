import { MEDIA_LIMITS, type MediaMimeType } from "@/lib/contracts/media";
import type { MediaItem } from "@/remotion/shared/config";

const MB = 1024 * 1024;

/** Some browsers report an empty type for AVIF or MOV; fall back to the extension. */
const EXTENSION_TYPES: Record<string, MediaMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export const ACCEPT_ATTRIBUTE = [...Object.keys(MEDIA_LIMITS), ...Object.keys(EXTENSION_TYPES).map((e) => `.${e}`)].join(",");

export type FileCheck =
  | { ok: true; mimeType: MediaMimeType; kind: "image" | "video" }
  | { ok: false; message: string };

/** PRD 3.2 formats and limits: images up to 64 MB, video up to 100 MB. */
export function checkFile(file: { name: string; type: string; size: number }): FileCheck {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = (file.type in MEDIA_LIMITS ? file.type : EXTENSION_TYPES[extension]) as MediaMimeType | undefined;
  if (!mimeType) {
    return { ok: false, message: `${file.name}: format tidak didukung. Pakai JPG, PNG, WEBP, AVIF, MP4, WEBM atau MOV.` };
  }
  const limit = MEDIA_LIMITS[mimeType];
  if (file.size > limit) {
    return {
      ok: false,
      message: `${file.name}: ${(file.size / MB).toFixed(0)} MB, batasnya ${limit / MB} MB untuk ${mimeType.startsWith("video") ? "video" : "gambar"}.`,
    };
  }
  return { ok: true, mimeType, kind: mimeType.startsWith("video") ? "video" : "image" };
}

/**
 * Turns a picked file into a MediaItem that plays in the preview right away.
 * The object URL lives only in this tab; uploading to R2 replaces it in Fase 1.
 */
export async function readMediaFile(file: File, kind: "image" | "video"): Promise<MediaItem> {
  const src = URL.createObjectURL(file);
  const base = { id: crypto.randomUUID(), type: kind, src, name: file.name } as const;
  try {
    if (kind === "image") {
      const img = new Image();
      img.src = src;
      await img.decode();
      return { ...base, width: img.naturalWidth, height: img.naturalHeight };
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = src;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("unreadable"));
    });
    return {
      ...base,
      width: video.videoWidth || undefined,
      height: video.videoHeight || undefined,
      durationSec: Number.isFinite(video.duration) && video.duration > 0 ? video.duration : undefined,
    };
  } catch {
    URL.revokeObjectURL(src);
    throw new Error(
      kind === "video"
        ? `${file.name}: video tidak bisa diputar di browser ini. File mungkin rusak, atau codec-nya tidak didukung browser ini. Coba ekspor ulang sebagai MP4 (H.264).`
        : `${file.name}: gambar tidak bisa dibaca. File mungkin rusak atau isinya tidak cocok dengan ekstensinya.`,
    );
  }
}
