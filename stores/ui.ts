"use client";

import { create } from "zustand";

/** Editor chrome state. Kept apart from the showreel config, which is what gets saved and rendered. */
type UiState = {
  templatesOpen: boolean;
  settingsOpen: boolean;
  toggleTemplates: () => void;
  toggleSettings: () => void;
  /** Problems with files the user just added, shown until dismissed or replaced. */
  mediaErrors: string[];
  setMediaErrors: (errors: string[]) => void;
  /** True while picked files are being read (large videos take a moment). */
  mediaBusy: boolean;
  setMediaBusy: (busy: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  templatesOpen: true,
  settingsOpen: true,
  toggleTemplates: () => set((s) => ({ templatesOpen: !s.templatesOpen })),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  mediaErrors: [],
  setMediaErrors: (mediaErrors) => set({ mediaErrors }),
  mediaBusy: false,
  setMediaBusy: (mediaBusy) => set({ mediaBusy }),
}));
