import type { ComponentType } from "react";
import { TEMPLATE_CATALOG } from "./catalog";
import type { ShowreelProps } from "./shared/config";
import type { TemplateDefinition } from "./shared/template";
import { Comet } from "./templates/comet/Comet";
import { Rise } from "./templates/rise/Rise";

const COMPONENTS: Record<string, ComponentType<ShowreelProps>> = {
  comet: Comet,
  rise: Rise,
};

/** Catalog entries with their compositions attached. Used by the Remotion Root and the editor Player. */
export const TEMPLATES: TemplateDefinition[] = TEMPLATE_CATALOG.map((meta) => {
  const component = COMPONENTS[meta.slug];
  if (!component) throw new Error(`Template "${meta.slug}" is in the catalog but has no component`);
  return { ...meta, component };
});

export function getTemplate(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug);
}
