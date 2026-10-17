"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUi } from "@/stores/ui";
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

function PanelIcon({ side, open }: { side: "left" | "right"; open: boolean }) {
  const x = side === "left" ? 2.5 : 9.5;
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <rect x={x} y="3.5" width="4" height="9" rx="0.5" fill="currentColor" opacity={open ? 1 : 0.25} />
    </svg>
  );
}

/**
 * Three-column editor (PRD 5.2): templates | canvas | settings. Side panels collapse on desktop
 * (PRD 3.1, 3.3). Below 1024 px the columns stack in the same order, so Tab order matches the screen.
 */
export function Editor() {
  const templatesOpen = useUi((s) => s.templatesOpen);
  const settingsOpen = useUi((s) => s.settingsOpen);
  const toggleTemplates = useUi((s) => s.toggleTemplates);
  const toggleSettings = useUi((s) => s.toggleSettings);

  const columns = [templatesOpen ? "256px" : null, "minmax(0,1fr)", settingsOpen ? "304px" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
        <span className="font-display text-lg font-semibold tracking-tight">ShowForge</span>
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            className="hidden lg:inline-flex"
            aria-controls="panel-templates"
            aria-expanded={templatesOpen}
            aria-label={templatesOpen ? "Sembunyikan panel template" : "Tampilkan panel template"}
            title={templatesOpen ? "Sembunyikan panel template" : "Tampilkan panel template"}
            onClick={toggleTemplates}
          >
            <PanelIcon side="left" open={templatesOpen} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="hidden lg:inline-flex"
            aria-controls="panel-settings"
            aria-expanded={settingsOpen}
            aria-label={settingsOpen ? "Sembunyikan panel pengaturan" : "Tampilkan panel pengaturan"}
            title={settingsOpen ? "Sembunyikan panel pengaturan" : "Tampilkan panel pengaturan"}
            onClick={toggleSettings}
          >
            <PanelIcon side="right" open={settingsOpen} />
          </Button>
          <ThemeToggle />
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
          <CopyJsonButton />
        </div>
      </header>

      <div
        className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:[grid-template-columns:var(--editor-cols)]"
        style={{ "--editor-cols": columns } as CSSProperties}
      >
        <aside
          id="panel-templates"
          aria-label="Template"
          className={cn(
            "border-b border-line bg-panel p-4 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0",
            !templatesOpen && "lg:hidden",
          )}
        >
          <TemplatePanel />
        </aside>

        <main className="flex h-[85svh] min-h-0 flex-col bg-stage p-4 lg:h-auto lg:p-6">
          <h1 className="sr-only">Editor showreel</h1>
          <Canvas />
        </main>

        <aside
          id="panel-settings"
          aria-label="Pengaturan"
          className={cn(
            "border-t border-line bg-panel lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l",
            !settingsOpen && "lg:hidden",
          )}
        >
          <SettingsPanel />
        </aside>
      </div>
    </div>
  );
}
