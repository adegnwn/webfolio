import { beforeEach, describe, expect, it } from "vitest";
import { checkFile } from "@/lib/media-files";
import { MAX_MEDIA_ITEMS, type MediaItem } from "@/remotion/shared/config";
import { EXAMPLE_MEDIA } from "@/remotion/shared/media";
import { useEditor } from "@/stores/editor";

const MB = 1024 * 1024;
const local = (id: string): MediaItem => ({ id, type: "image", src: `https://cdn.test/${id}.png`, name: `${id}.png` });
const ids = () => useEditor.getState().config.media.map((m) => m.id);

describe("editor media", () => {
  beforeEach(() => useEditor.getState().restoreExamples());

  it("replaces the example media with the first real files", () => {
    useEditor.getState().addMedia([local("a"), local("b")]);
    expect(ids()).toEqual(["a", "b"]);
  });

  it("appends once the user has their own media", () => {
    useEditor.getState().addMedia([local("a")]);
    useEditor.getState().addMedia([local("b")]);
    expect(ids()).toEqual(["a", "b"]);
  });

  it("stops at the media limit and reports what was skipped", () => {
    const many = Array.from({ length: MAX_MEDIA_ITEMS + 3 }, (_, i) => local(`m${i}`));
    expect(useEditor.getState().addMedia(many)).toEqual({ added: MAX_MEDIA_ITEMS, skipped: 3 });
    expect(ids()).toHaveLength(MAX_MEDIA_ITEMS);
  });

  it("moves and removes items", () => {
    useEditor.getState().addMedia([local("a"), local("b"), local("c")]);
    useEditor.getState().moveMedia("c", 0);
    expect(ids()).toEqual(["c", "a", "b"]);
    useEditor.getState().removeMedia("a");
    expect(ids()).toEqual(["c", "b"]);
  });

  it("can be emptied and brought back to the examples", () => {
    for (const id of ids()) useEditor.getState().removeMedia(id);
    expect(ids()).toEqual([]);
    useEditor.getState().restoreExamples();
    expect(ids()).toEqual(EXAMPLE_MEDIA.map((m) => m.id));
  });
});

describe("checkFile (PRD 3.2 formats and limits)", () => {
  it.each([
    ["shot.png", "image/png", 2 * MB, "image"],
    ["clip.mp4", "video/mp4", 90 * MB, "video"],
    ["clip.MOV", "", 10 * MB, "video"],
    ["photo.avif", "", 1 * MB, "image"],
  ] as const)("accepts %s", (name, type, size, kind) => {
    expect(checkFile({ name, type, size })).toMatchObject({ ok: true, kind });
  });

  it("rejects images over 64 MB and videos over 100 MB", () => {
    expect(checkFile({ name: "big.png", type: "image/png", size: 65 * MB }).ok).toBe(false);
    expect(checkFile({ name: "big.mp4", type: "video/mp4", size: 101 * MB }).ok).toBe(false);
  });

  it("rejects other formats with a message naming the file", () => {
    const result = checkFile({ name: "doc.pdf", type: "application/pdf", size: MB });
    expect(result).toEqual({ ok: false, message: expect.stringContaining("doc.pdf") });
  });
});
