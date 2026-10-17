import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Server routes import the template catalog. If anything it imports reaches the main "remotion"
 * entry, Next.js fails at build time ("React.createContext is undefined"). Walk the relative
 * imports from catalog.ts and fail early instead.
 */
function reachable(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const source = readFileSync(entry, "utf8");
  for (const [, spec] of source.matchAll(/from\s+"(\.[^"]+)"/g)) {
    const base = path.resolve(path.dirname(entry), spec);
    const file = [".ts", ".tsx"].map((ext) => base + ext).find((f) => {
      try {
        readFileSync(f);
        return true;
      } catch {
        return false;
      }
    });
    if (file) reachable(file, seen);
  }
  return seen;
}

describe("remotion/catalog.ts", () => {
  it("never imports the React part of Remotion", () => {
    const files = [...reachable(path.resolve("remotion/catalog.ts"))];
    const offenders = files.filter((f) => /from\s+"remotion"/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(process.cwd(), f))).toEqual([]);
  });
});
