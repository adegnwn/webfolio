"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { TEMPLATE_CATALOG } from "@/remotion/catalog";
import type { TemplateType } from "@/remotion/shared/template";
import { useEditor } from "@/stores/editor";

const TABS: { type: TemplateType; label: string }[] = [
  { type: "SHOWREEL", label: "Showreel" },
  { type: "LOOP", label: "Loop" },
];

const NEW_FOR_MS = 30 * 24 * 60 * 60 * 1000;

// "Baru" depends on today's date, so it is decided in the browser only (the prerendered shell has no date).
let clientNow: number | null = null;
const noopSubscribe = () => () => {};
const getClientNow = () => (clientNow ??= Date.now());
const getServerNow = () => null;

export function TemplatePanel() {
  const selected = useEditor((s) => s.config.templateSlug);
  const selectTemplate = useEditor((s) => s.selectTemplate);
  const [tab, setTab] = useState<TemplateType>("SHOWREEL");
  const [query, setQuery] = useState("");
  const now = useSyncExternalStore(noopSubscribe, getClientNow, getServerNow);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.type, TEMPLATE_CATALOG.filter((x) => x.type === t.type).length])),
    [],
  );
  const q = query.trim().toLowerCase();
  const visible = TEMPLATE_CATALOG.filter(
    (t) =>
      t.type === tab && (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
  );

  return (
    <section aria-labelledby="templates-heading" className="flex min-h-0 flex-col gap-3">
      <h2 id="templates-heading" className="sr-only">
        Template
      </h2>
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari template"
        aria-label="Cari template"
      />

      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={(v) => v && setTab(v as TemplateType)}
        aria-label="Jenis template"
        className="grid-cols-2"
      >
        {TABS.map((t) => (
          <ToggleGroupItem key={t.type} value={t.type}>
            {t.label} <span className="opacity-70">{counts[t.type]}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ul aria-label="Daftar template" className="flex min-h-0 flex-col gap-1.5 overflow-y-auto">
        {visible.map((t) => {
          const isSelected = t.slug === selected;
          const isNew = now !== null && now - new Date(t.publishedAt).getTime() < NEW_FOR_MS;
          return (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => selectTemplate(t.slug)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full cursor-pointer rounded-md border p-3 text-left transition-colors duration-100",
                  isSelected ? "border-ember bg-control" : "border-transparent hover:bg-control",
                )}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-base font-semibold">{t.name}</span>
                  {isNew ? <span className="text-xs text-muted-foreground">Baru</span> : null}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t.description}</span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="rounded-md bg-control p-3 text-xs leading-relaxed text-muted-foreground">
            {q
              ? `Tidak ada template ${tab === "LOOP" ? "loop" : "showreel"} yang cocok dengan "${query.trim()}".`
              : tab === "LOOP"
                ? "Belum ada template loop."
                : "Belum ada template showreel."}
          </li>
        ) : null}
      </ul>
    </section>
  );
}
