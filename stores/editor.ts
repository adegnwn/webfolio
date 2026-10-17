"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { getTemplateMeta } from "@/remotion/catalog";
import { defaultConfig } from "@/remotion/composition";
import { MAX_MEDIA_ITEMS, UniversalSettings, type MediaItem, type ShowreelConfig } from "@/remotion/shared/config";
import { EXAMPLE_MEDIA, isExampleMedia } from "@/remotion/shared/media";
import { paramDefaults } from "@/remotion/shared/params";

const DEFAULT_TEMPLATE = "comet";
const DEFAULT_SETTINGS = UniversalSettings.parse({});

function releaseLocalFile(item: MediaItem) {
  if (item.src.startsWith("blob:")) URL.revokeObjectURL(item.src);
}

type EditorState = {
  config: ShowreelConfig;
  /** Switches template; settings and media carry over, template options reset to that template's defaults. */
  selectTemplate: (slug: string) => void;
  updateSettings: (patch: Partial<ShowreelConfig["settings"]>) => void;
  setParam: (key: string, value: number) => void;
  resetParam: (key: string) => void;
  /** PRD 3.3 "Reset to defaults": every setting and template option, media stays. */
  resetAll: () => void;

  /**
   * Adds media at the end. While only example media is shown, the first real file replaces it
   * (PRD 3.2: "Example media" until the user brings their own). Returns how many did not fit.
   */
  addMedia: (items: MediaItem[]) => { added: number; skipped: number };
  removeMedia: (id: string) => void;
  moveMedia: (id: string, toIndex: number) => void;
  restoreExamples: () => void;
};

export const useEditor = create<EditorState>((set, get) => ({
  config: defaultConfig(DEFAULT_TEMPLATE),

  selectTemplate: (slug) =>
    set(({ config }) => {
      const template = getTemplateMeta(slug);
      if (!template || slug === config.templateSlug) return {};
      return { config: { ...config, templateSlug: slug, templateParams: paramDefaults(template.params) } };
    }),

  updateSettings: (patch) =>
    set(({ config }) => ({ config: { ...config, settings: { ...config.settings, ...patch } } })),

  setParam: (key, value) =>
    set(({ config }) => ({ config: { ...config, templateParams: { ...config.templateParams, [key]: value } } })),

  resetParam: (key) =>
    set(({ config }) => {
      const spec = getTemplateMeta(config.templateSlug)?.params[key];
      if (!spec) return {};
      return { config: { ...config, templateParams: { ...config.templateParams, [key]: spec.default } } };
    }),

  resetAll: () =>
    set(({ config }) => {
      const template = getTemplateMeta(config.templateSlug);
      return {
        config: {
          ...config,
          settings: DEFAULT_SETTINGS,
          templateParams: template ? paramDefaults(template.params) : {},
        },
      };
    }),

  addMedia: (items) => {
    const { config } = get();
    const onlyExamples = config.media.length > 0 && config.media.every(isExampleMedia);
    const current = onlyExamples ? [] : config.media;
    const room = Math.max(MAX_MEDIA_ITEMS - current.length, 0);
    const accepted = items.slice(0, room);
    items.slice(room).forEach(releaseLocalFile);
    if (accepted.length > 0) set({ config: { ...config, media: [...current, ...accepted] } });
    return { added: accepted.length, skipped: items.length - accepted.length };
  },

  removeMedia: (id) =>
    set(({ config }) => {
      const item = config.media.find((m) => m.id === id);
      if (!item) return {};
      releaseLocalFile(item);
      return { config: { ...config, media: config.media.filter((m) => m.id !== id) } };
    }),

  moveMedia: (id, toIndex) =>
    set(({ config }) => {
      const from = config.media.findIndex((m) => m.id === id);
      const to = Math.min(Math.max(toIndex, 0), config.media.length - 1);
      if (from === -1 || from === to) return {};
      return { config: { ...config, media: arrayMove(config.media, from, to) } };
    }),

  restoreExamples: () =>
    set(({ config }) => {
      config.media.forEach(releaseLocalFile);
      return { config: { ...config, media: EXAMPLE_MEDIA } };
    }),
}));
