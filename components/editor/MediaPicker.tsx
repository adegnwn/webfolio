"use client";

import { useRef, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { ACCEPT_ATTRIBUTE } from "@/lib/media-files";
import { useUi } from "@/stores/ui";
import { useAddFiles } from "./useAddFiles";

/** A button that opens the file picker. The input itself stays hidden. */
export function MediaPicker({ children, ...props }: Omit<ComponentProps<typeof Button>, "onClick">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = useAddFiles();
  const busy = useUi((s) => s.mediaBusy);

  return (
    <>
      <Button {...props} disabled={busy || props.disabled} onClick={() => inputRef.current?.click()}>
        {busy ? "Memproses file…" : children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          // Allow picking the same file again after removing it.
          e.target.value = "";
        }}
      />
    </>
  );
}
