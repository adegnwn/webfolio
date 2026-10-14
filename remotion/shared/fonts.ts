import { useEffect, useState } from "react";
import { useDelayRender } from "remotion";

// Loaded from @fontsource-variable packages: remotion/index.ts for renders, app/globals.css for the preview.
export const DISPLAY_FONT = '"Bricolage Grotesque Variable", system-ui, sans-serif';
export const UI_FONT = '"Instrument Sans Variable", system-ui, sans-serif';

/** Holds the render until the font is ready, so the first frames never use a fallback face. */
export function useFontReady(weight: number, family: string) {
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`font ${family}`));
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) {
      continueRender(handle);
      return;
    }
    document.fonts
      .load(`${weight} 64px ${family}`)
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [continueRender, family, handle, weight]);
}
