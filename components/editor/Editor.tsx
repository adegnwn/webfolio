"use client";

import dynamic from "next/dynamic";
import { CopyJsonButton } from "./CopyJsonButton";
import { SettingsPanel } from "./SettingsPanel";
import { TemplatePanel } from "./TemplatePanel";

// The Remotion Player reads the clock and measures the DOM, so the canvas renders in the browser only.
const Canvas = dynamic(() => import("./Canvas").then((m) => m.Canvas), {
  ssr: false,
  loading: () => (
    <div className="grid flex-1 place-items-center text-sm text-muted-foreground">Memuat preview…</div>
  ),
});

/**
 * Three-column editor (PRD 5.2): templates | canvas | settings.
 * Below 1024 px the columns stack in the same order, so Tab order matches what is on screen.
 */
export function Editor() {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line px-4">
        <span className="font-display text-lg font-semibold tracking-tight">ShowForge</span>
        <CopyJsonButton />
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[256px_minmax(0,1fr)_304px]">
        <aside
          aria-label="Template"
          className="border-b border-line bg-panel p-4 lg:border-b-0 lg:min-h-0 lg:overflow-y-auto lg:border-r"
        >
          <TemplatePanel />
        </aside>

        <main className="flex h-[70svh] min-h-0 flex-col p-4 lg:h-auto lg:p-6">
          <h1 className="sr-only">Editor showreel</h1>
          <Canvas />
        </main>

        <aside
          aria-label="Pengaturan"
          className="border-t border-line bg-panel lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l"
        >
          <SettingsPanel />
        </aside>
      </div>
    </div>
  );
}
