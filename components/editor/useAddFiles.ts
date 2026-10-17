"use client";

import { useCallback } from "react";
import { checkFile, readMediaFile } from "@/lib/media-files";
import { MAX_MEDIA_ITEMS, type MediaItem } from "@/remotion/shared/config";
import { useEditor } from "@/stores/editor";
import { useUi } from "@/stores/ui";

/** Shared by the "Tambah media" button and the drop zone on the canvas. */
export function useAddFiles() {
  const addMedia = useEditor((s) => s.addMedia);
  const setErrors = useUi((s) => s.setMediaErrors);
  const setBusy = useUi((s) => s.setMediaBusy);

  return useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      setBusy(true);
      const errors: string[] = [];
      const items: MediaItem[] = [];
      for (const file of list) {
        const check = checkFile(file);
        if (!check.ok) {
          errors.push(check.message);
          continue;
        }
        try {
          items.push(await readMediaFile(file, check.kind));
        } catch (err) {
          errors.push(err instanceof Error ? err.message : `${file.name}: file tidak bisa dibaca.`);
        }
      }
      const { skipped } = addMedia(items);
      if (skipped > 0) {
        errors.push(`${skipped} file tidak ditambahkan: satu showreel maksimal berisi ${MAX_MEDIA_ITEMS} media.`);
      }
      setErrors(errors);
      setBusy(false);
    },
    [addMedia, setBusy, setErrors],
  );
}
