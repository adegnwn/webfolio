export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sf-theme";

/**
 * Runs in <head> before the first paint: applies the saved theme, or the system preference
 * when nothing is saved. Kept tiny and dependency-free because it is inlined as a string.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t)}catch(e){}})()`;

export function readTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

/** Notifies subscribers when the class on <html> changes (this tab's toggle or the init script). */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
