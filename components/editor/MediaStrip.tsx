"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MAX_MEDIA_ITEMS, type MediaItem } from "@/remotion/shared/config";
import { isExampleMedia, resolveSrc } from "@/remotion/shared/media";
import { cn } from "@/lib/utils";
import { useEditor } from "@/stores/editor";
import { useUi } from "@/stores/ui";
import { MediaPicker } from "./MediaPicker";

const labelOf = (item: MediaItem, index: number) => item.name ?? `Media ${index + 1}`;

function Thumb({ item, index }: { item: MediaItem; index: number }) {
  const removeMedia = useEditor((s) => s.removeMedia);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const label = labelOf(item, index);
  const src = resolveSrc(item.src);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative shrink-0", isDragging && "z-10")}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`${label}, urutan ${index + 1}. Tekan spasi untuk memindahkan.`}
        className={cn(
          "relative h-20 w-16 cursor-grab touch-none overflow-hidden rounded-md border bg-control active:cursor-grabbing",
          isDragging ? "border-ember" : "border-line",
        )}
      >
        {item.type === "image" ? (
          // Local object URLs and bundled SVGs: next/image adds nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" draggable={false} className="size-full object-cover" />
        ) : (
          <video src={src} muted preload="metadata" className="size-full object-cover" />
        )}
        <span className="absolute bottom-1 left-1 rounded-sm bg-background/85 px-1 text-[11px] font-medium text-foreground tabular-nums">
          {index + 1}
        </span>
        {item.type === "video" ? (
          <span className="absolute top-1 left-1 rounded-sm bg-background/85 px-1 text-[11px] text-foreground">Video</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => removeMedia(item.id)}
        aria-label={`Hapus ${label}`}
        data-touch-target="expanded"
        className="absolute -top-2 -right-2 grid size-7 cursor-pointer place-items-center rounded-full after:absolute after:-inset-2 after:content-[''] border border-line bg-panel text-muted-foreground transition-colors duration-100 hover:bg-hover hover:text-foreground"
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}

/** PRD 3.2: thumbnail strip under the canvas, drag to reorder, "+" to add. */
export function MediaStrip() {
  const media = useEditor((s) => s.config.media);
  const moveMedia = useEditor((s) => s.moveMedia);
  const errors = useUi((s) => s.mediaErrors);
  const setErrors = useUi((s) => s.setMediaErrors);
  const onlyExamples = media.length > 0 && media.every(isExampleMedia);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const position = (id: string | number) => media.findIndex((m) => m.id === id) + 1;
  const name = (id: string | number) => {
    const i = media.findIndex((m) => m.id === id);
    return i === -1 ? "Media" : labelOf(media[i], i);
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${name(active.id)} diangkat dari urutan ${position(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${name(active.id)} di atas urutan ${position(over.id)}.` : `${name(active.id)} di luar daftar.`,
    onDragEnd: ({ active, over }) =>
      over ? `${name(active.id)} diletakkan di urutan ${position(over.id)}.` : `${name(active.id)} diletakkan kembali.`,
    onDragCancel: ({ active }) => `Batal. ${name(active.id)} kembali ke urutan ${position(active.id)}.`,
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    moveMedia(String(active.id), media.findIndex((m) => m.id === over.id));
  }

  return (
    <section aria-labelledby="media-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h2 id="media-heading" className="text-xs font-semibold text-muted-foreground">
          Media <span className="tabular-nums">{media.length}/{MAX_MEDIA_ITEMS}</span>
          {onlyExamples ? <span className="font-normal"> · contoh, diganti saat kamu menambah media</span> : null}
        </h2>
        <MediaPicker size="sm">Tambah media</MediaPicker>
      </div>

      {errors.length > 0 ? (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-md border border-destructive/40 p-2 text-xs text-destructive">
          <ul className="flex flex-col gap-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setErrors([])}
            className="min-h-11 shrink-0 cursor-pointer rounded-sm px-2 text-foreground hover:bg-hover lg:min-h-0 lg:py-0.5"
          >
            Tutup
          </button>
        </div>
      ) : null}

      {media.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                "Tekan spasi untuk mengangkat media. Gunakan panah kiri dan kanan untuk memindahkan, spasi lagi untuk meletakkan, Escape untuk batal.",
            },
          }}
        >
          <SortableContext items={media.map((m) => m.id)} strategy={horizontalListSortingStrategy}>
            {/* pt/pr leave room for the remove buttons that sit on the thumbnail corners */}
            <ol aria-label="Urutan media" className="flex gap-3 overflow-x-auto pt-2 pr-2 pb-1">
              {media.map((item, index) => (
                <Thumb key={item.id} item={item} index={index} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : null}
    </section>
  );
}
