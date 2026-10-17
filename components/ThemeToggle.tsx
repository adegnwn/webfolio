"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, readTheme, subscribeTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path d="M6.2 1.6a6.5 6.5 0 1 0 8.2 8.2A5.3 5.3 0 0 1 6.2 1.6z" fill="currentColor" />
    </svg>
  );
}

/** Switches between light and dark. The server render has no theme, so the icon appears after hydration. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => null);
  const next = theme === "light" ? "dark" : "light";
  const label = theme === null ? "Ganti tema" : theme === "light" ? "Pakai mode gelap" : "Pakai mode terang";

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={() => applyTheme(next)}
    >
      {theme === "light" ? <MoonIcon /> : theme === "dark" ? <SunIcon /> : null}
    </Button>
  );
}
