"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { compositionMetadata } from "@/remotion/composition";
import type { ShowreelProps } from "@/remotion/shared/config";
import { isExampleMedia } from "@/remotion/shared/media";
import { getTemplate } from "@/remotion/registry";
import { useEditor } from "@/stores/editor";
import { MediaPicker } from "./MediaPicker";
import { MediaStrip } from "./MediaStrip";
import { useAddFiles } from "./useAddFiles";

function timecode(frame: number, fps: number) {
  const total = Math.max(frame, 0) / fps;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const tenth = Math.floor((total * 10) % 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${tenth}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />
    </svg>
  );
}

/**
 * The preview is the real Remotion composition in the Player, so what plays here is
 * what the render produces (PRD risk R2).
 */
export function Canvas() {
  const config = useEditor((s) => s.config);
  const template = getTemplate(config.templateSlug);
  const playerRef = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  // Keyed by template: switching template remounts the Player, which autoplays again.
  const [playState, setPlayState] = useState({ slug: config.templateSlug, playing: true });
  const playing = playState.slug === config.templateSlug ? playState.playing : true;

  const inputProps = useMemo<ShowreelProps>(
    () => ({ config, resolution: "1080p", watermark: false }),
    [config],
  );
  const meta = useMemo(() => compositionMetadata({ config, resolution: "1080p" }), [config]);
  const hasMedia = config.media.length > 0;
  const usesExamples = hasMedia && config.media.every(isExampleMedia);
  const restoreExamples = useEditor((s) => s.restoreExamples);
  const addFiles = useAddFiles();
  // Counts nested dragenter/dragleave pairs so the overlay does not flicker over child elements.
  const [dragDepth, setDragDepth] = useState(0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const slug = template?.slug ?? "";
    const onPlay = () => setPlayState({ slug, playing: true });
    const onPause = () => setPlayState({ slug, playing: false });
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [template, hasMedia]); // hasMedia: the Player unmounts while there is no media


  const toggle = useCallback(() => playerRef.current?.toggle(), []);
  const seek = useCallback((f: number) => {
    playerRef.current?.seekTo(f);
    setFrame(f);
  }, []);

  if (!template) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Template &ldquo;{config.templateSlug}&rdquo; tidak ditemukan. Pilih template lain di panel kiri.
      </p>
    );
  }

  const last = Math.max(meta.durationInFrames - 1, 1);

  // Drop zone (PRD 3.2): files dropped anywhere on the stage are added like picked files.
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");
  const dropHandlers = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragDepth((d) => d + 1);
    },
    onDragOver: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      setDragDepth((d) => Math.max(d - 1, 0));
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragDepth(0);
      void addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Stage: the video keeps its aspect ratio and fits the space left by the panels. */}
      <div className="relative min-h-[320px] flex-1 [container-type:size]" {...dropHandlers}>
        {hasMedia ? (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline outline-1 outline-line"
            style={{
              aspectRatio: `${meta.width} / ${meta.height}`,
              width: `min(100cqw, 100cqh * ${meta.width / meta.height})`,
            }}
          >
            <Player
              key={template.slug}
              ref={playerRef}
              component={template.component}
              inputProps={inputProps}
              durationInFrames={meta.durationInFrames}
              fps={meta.fps}
              compositionWidth={meta.width}
              compositionHeight={meta.height}
              style={{ width: "100%", height: "100%" }}
              autoPlay
              loop
              clickToPlay
              spaceKeyToPlayOrPause
              renderLoading={() => (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">Memuat preview…</div>
              )}
              errorFallback={({ error }) => (
                <div role="alert" className="grid h-full place-items-center p-6 text-center text-sm text-destructive">
                  Preview gagal dimuat: {error.message}
                </div>
              )}
            />
            {usesExamples ? (
              <span className="pointer-events-none absolute top-2 left-2 rounded-sm bg-background/80 px-2 py-1 text-xs text-muted-foreground">
                Media contoh
              </span>
            ) : null}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-line p-6 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Belum ada media. Tarik gambar atau video ke sini, atau pilih dari komputermu. JPG, PNG, WEBP, AVIF sampai
              64 MB, MP4, WEBM, MOV sampai 100 MB.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <MediaPicker variant="primary">Pilih file</MediaPicker>
              <Button variant="ghost" onClick={restoreExamples}>
                Pakai media contoh
              </Button>
            </div>
          </div>
        )}
        {dragDepth > 0 ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-md border-2 border-dashed border-ember bg-background/80">
            <p className="text-sm font-medium">Lepaskan untuk menambahkan media</p>
          </div>
        ) : null}
      </div>

      {hasMedia ? (
        /* Transport: play/pause, scrubber with the ember playhead, timecode. */
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Jeda preview" : "Putar preview"}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md bg-control text-foreground transition-colors duration-100 hover:bg-hover lg:size-9"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <input
            type="range"
            min={0}
            max={last}
            value={Math.min(frame, last)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Posisi preview"
            className="sf-scrubber h-11 min-w-0 flex-1 cursor-pointer lg:h-9"
            style={{ ["--progress" as string]: `${(Math.min(frame, last) / last) * 100}%` }}
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            <span className="text-foreground">{timecode(frame, meta.fps)}</span> / {timecode(last, meta.fps)}
          </span>
        </div>
      ) : null}

      <MediaStrip />
    </div>
  );
}
