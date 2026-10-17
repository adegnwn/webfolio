import type { ComponentType } from "react";
import { TEMPLATE_CATALOG } from "./catalog";
import type { ShowreelProps } from "./shared/config";
import type { TemplateDefinition } from "./shared/template";
import { Comet } from "./templates/comet/Comet";
import { Folio } from "./templates/folio/Folio";
import { GridFade } from "./templates/gridfade/GridFade";
import { Hover } from "./templates/hover/Hover";
import { Marquee } from "./templates/marquee/Marquee";
import { Orbit } from "./templates/orbit/Orbit";
import { Reveal } from "./templates/reveal/Reveal";
import { Rise } from "./templates/rise/Rise";
import { Rolodex } from "./templates/rolodex/Rolodex";
import { Slide } from "./templates/slide/Slide";
import { Snap } from "./templates/snap/Snap";
import { Stack } from "./templates/stack/Stack";
import { Unveil } from "./templates/unveil/Unveil";
import { VFlip } from "./templates/vflip/VFlip";
import { Viscose } from "./templates/viscose/Viscose";

const COMPONENTS: Record<string, ComponentType<ShowreelProps>> = {
  comet: Comet,
  rise: Rise,
  rolodex: Rolodex,
  slide: Slide,
  vflip: VFlip,
  reveal: Reveal,
  snap: Snap,
  folio: Folio,
  stack: Stack,
  unveil: Unveil,
  orbit: Orbit,
  viscose: Viscose,
  hover: Hover,
  marquee: Marquee,
  gridfade: GridFade,
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
