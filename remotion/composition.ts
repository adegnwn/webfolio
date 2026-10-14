import { ShowreelConfig, type ShowreelProps } from "./shared/config";
import { getDimensions, FPS } from "./shared/dimensions";
import { EXAMPLE_MEDIA } from "./shared/media";
import { paramDefaults } from "./shared/params";
import { getTemplateMeta } from "./catalog";

/** Starting config for a template: PRD defaults plus the bundled example media. */
export function defaultConfig(templateSlug: string): ShowreelConfig {
  const template = getTemplateMeta(templateSlug);
  if (!template) throw new Error(`Unknown template "${templateSlug}"`);
  return ShowreelConfig.parse({
    version: 1,
    templateSlug,
    settings: {},
    templateParams: paramDefaults(template.params),
    media: EXAMPLE_MEDIA,
  });
}

/** Size and length of a showreel. Shared by the Remotion Root and the editor's Player. */
export function compositionMetadata({ config, resolution }: Pick<ShowreelProps, "config" | "resolution">) {
  const template = getTemplateMeta(config.templateSlug);
  if (!template) throw new Error(`Unknown template "${config.templateSlug}"`);
  return {
    fps: FPS,
    durationInFrames: template.durationInFrames(config, FPS),
    ...getDimensions(config.settings.aspectRatio, resolution),
  };
}
