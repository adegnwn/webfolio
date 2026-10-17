"use client";

import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ASPECT_RATIOS, UniversalSettings, type AspectRatio, type Ending } from "@/remotion/shared/config";
import { getDimensions } from "@/remotion/shared/dimensions";
import type { ParamSpec } from "@/remotion/shared/params";
import { getTemplateMeta } from "@/remotion/catalog";
import { useEditor } from "@/stores/editor";

const DEFAULTS = UniversalSettings.parse({});

const ENDING_LABELS: Record<Ending, string> = { flood: "Flood", wipe: "Wipe" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-b-0">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function formatValue(value: number, spec: Pick<ParamSpec, "step" | "unit">) {
  const decimals = spec.step >= 1 ? 0 : spec.step >= 0.1 ? 1 : 2;
  const suffix = spec.unit === "deg" ? "°" : spec.unit === "x" ? "×" : spec.unit === "%" ? "%" : "";
  return `${value.toFixed(decimals)}${suffix}`;
}

type SliderFieldProps = {
  label: string;
  value: number;
  spec: Pick<ParamSpec, "min" | "max" | "step" | "unit" | "default">;
  suffix?: string;
  onChange: (v: number) => void;
};

/** Slider with its numeric value and a per-field reset that appears once the value moves off default. */
function SliderField({ label, value, spec, suffix, onChange }: SliderFieldProps) {
  const id = useId();
  const changed = Math.abs(value - spec.default) > spec.step / 2;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label id={id} className="text-sm">
          {label}
        </label>
        <span className="flex items-center gap-1">
          {changed ? (
            <button
              type="button"
              onClick={() => onChange(spec.default)}
              className="min-h-11 cursor-pointer rounded-sm px-2 text-xs lg:min-h-0 lg:px-1.5 lg:py-0.5 text-muted-foreground transition-colors duration-100 hover:bg-hover hover:text-foreground"
              aria-label={`Kembalikan ${label} ke ${formatValue(spec.default, spec)}${suffix ?? ""}`}
            >
              Reset
            </button>
          ) : null}
          <span className="min-w-12 text-right text-sm tabular-nums">
            {formatValue(value, spec)}
            {suffix}
          </span>
        </span>
      </div>
      <Slider
        aria-labelledby={id}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

// Written out in full so Tailwind generates the classes.
const CHOICE_COLUMNS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

/** A template choice (e.g. mask shape). Stored as the option's index. */
function ChoiceField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-sm">
        {label}
      </span>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(v) => v && onChange(Number(v))}
        aria-labelledby={id}
        className={CHOICE_COLUMNS[Math.min(options.length, 4)]}
      >
        {options.map((option, i) => (
          <ToggleGroupItem key={option} value={String(i)}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <span className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tabular-nums">{value}</span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-11 cursor-pointer rounded-md border border-line bg-control p-0.5 lg:size-8"
        />
      </span>
    </div>
  );
}

export function SettingsPanel() {
  const config = useEditor((s) => s.config);
  const updateSettings = useEditor((s) => s.updateSettings);
  const setParam = useEditor((s) => s.setParam);
  const resetAll = useEditor((s) => s.resetAll);
  const brandId = useId();
  const { settings } = config;
  const template = getTemplateMeta(config.templateSlug);
  const output = getDimensions(settings.aspectRatio, "1080p");
  const backgroundColor = settings.background.type === "color" ? settings.background.color : "#070708";

  return (
    <div className="flex flex-col">
      <Section title="Rasio video">
        <ToggleGroup
          type="single"
          value={settings.aspectRatio}
          onValueChange={(v) => v && updateSettings({ aspectRatio: v as AspectRatio })}
          aria-label="Rasio video"
          className="grid-cols-4"
        >
          {ASPECT_RATIOS.map((r) => (
            <ToggleGroupItem key={r} value={r}>
              {r}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground tabular-nums">
          Output 1080p: {output.width} × {output.height} px
        </p>
      </Section>

      <Section title="Media">
        <ToggleGroup
          type="single"
          value={settings.mediaFit}
          onValueChange={(v) => v && updateSettings({ mediaFit: v as "crop" | "contain" })}
          aria-label="Cara media mengisi bingkai"
          className="grid-cols-2"
        >
          <ToggleGroupItem value="crop">Crop {settings.mediaAspectRatio}</ToggleGroupItem>
          <ToggleGroupItem value="contain">Contain</ToggleGroupItem>
        </ToggleGroup>
        <SliderField
          label="Skala media"
          value={settings.mediaScale}
          spec={{ min: 0.1, max: 2, step: 0.01, unit: "x", default: DEFAULTS.mediaScale }}
          onChange={(v) => updateSettings({ mediaScale: v })}
        />
        <SliderField
          label="Sudut membulat"
          value={settings.borderRadius}
          spec={{ min: 0, max: 100, step: 1, default: DEFAULTS.borderRadius }}
          suffix=" px"
          onChange={(v) => updateSettings({ borderRadius: v })}
        />
      </Section>

      {template?.usesHoldDuration ? (
        <Section title="Animasi">
          <SliderField
            label="Durasi tahan per media"
            value={settings.holdDuration}
            spec={{ min: 0, max: 3, step: 0.1, default: DEFAULTS.holdDuration }}
            suffix=" dtk"
            onChange={(v) => updateSettings({ holdDuration: v })}
          />
        </Section>
      ) : null}

      {template && Object.keys(template.params).length > 0 ? (
        <Section title={`Opsi ${template.name}`}>
          {Object.entries(template.params).map(([key, spec]) => {
            const value = config.templateParams[key] ?? spec.default;
            return spec.options ? (
              <ChoiceField
                key={`${template.slug}-${key}`}
                label={spec.label}
                options={spec.options}
                value={value}
                onChange={(v) => setParam(key, v)}
              />
            ) : (
              <SliderField
                key={`${template.slug}-${key}`}
                label={spec.label}
                value={value}
                spec={spec}
                onChange={(v) => setParam(key, v)}
              />
            );
          })}
        </Section>
      ) : null}

      {/* Loops have no ending; the brand end card only exists on showreels. */}
      {template?.type === "SHOWREEL" ? (
        <Section title="Akhir video">
          <div className="flex flex-col gap-2">
            <label htmlFor={brandId} className="text-sm">
              Nama brand
            </label>
            <Input
              id={brandId}
              value={settings.brand}
              maxLength={40}
              placeholder="Nama studio atau namamu"
              onChange={(e) => updateSettings({ brand: e.target.value })}
            />
          </div>
          <ToggleGroup
            type="single"
            value={settings.ending}
            onValueChange={(v) => v && updateSettings({ ending: v as Ending })}
            aria-label="Animasi penutup"
            className="grid-cols-2"
          >
            {(Object.keys(ENDING_LABELS) as Ending[]).map((e) => (
              <ToggleGroupItem key={e} value={e}>
                {ENDING_LABELS[e]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Section>
      ) : null}

      <Section title="Warna">
        <ColorField
          label="Latar"
          value={backgroundColor}
          onChange={(color) => updateSettings({ background: { type: "color", color } })}
        />
        <ColorField label={template?.type === "SHOWREEL" ? "Teks dan penutup" : "Teks"} value={settings.textColor} onChange={(textColor) => updateSettings({ textColor })} />
      </Section>

      <div className="px-4 py-4">
        <Button variant="ghost" size="sm" onClick={resetAll} className="w-full">
          Kembalikan semua pengaturan
        </Button>
      </div>
    </div>
  );
}
