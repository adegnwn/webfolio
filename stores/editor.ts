"use client";

import { create } from "zustand";
import { defaultConfig } from "@/remotion/composition";
import { UniversalSettings, type ShowreelConfig } from "@/remotion/shared/config";
import { paramDefaults } from "@/remotion/shared/params";
import { getTemplateMeta } from "@/remotion/catalog";

const DEFAULT_TEMPLATE = "comet";
const DEFAULT_SETTINGS = UniversalSettings.parse({});

type EditorState = {
  config: ShowreelConfig;
  /** Switches template; settings and media carry over, template options reset to that template's defaults. */
  selectTemplate: (slug: string) => void;
  updateSettings: (patch: Partial<ShowreelConfig["settings"]>) => void;
  setParam: (key: string, value: number) => void;
  resetParam: (key: string) => void;
  /** PRD 3.3 "Reset to defaults": every setting and template option, media stays. */
  resetAll: () => void;
};

export const useEditor = create<EditorState>((set) => ({
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
}));
