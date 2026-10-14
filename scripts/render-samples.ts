/**
 * Renders every template in a few aspect ratios with the example media.
 * Same call path the render worker will use: bundle -> selectComposition -> renderMedia.
 *
 *   npm run render:samples                 # all templates, 16:9 + 9:16 + 4:5, 720p
 *   npm run render:samples -- rise 1:1     # one template, one ratio
 *
 * Set REMOTION_BROWSER to use an existing Chrome headless shell instead of downloading one.
 */
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { defaultConfig } from "../remotion/composition";
import { ASPECT_RATIOS, type AspectRatio, type ShowreelProps } from "../remotion/shared/config";
import { TEMPLATE_CATALOG } from "../remotion/catalog";

const [onlyTemplate, onlyRatio] = process.argv.slice(2);
const ratios: AspectRatio[] = onlyRatio
  ? [onlyRatio as AspectRatio].filter((r) => ASPECT_RATIOS.includes(r))
  : ["16:9", "9:16", "4:5"];
const templates = TEMPLATE_CATALOG.filter((t) => !onlyTemplate || t.slug === onlyTemplate);
const outDir = path.resolve("out/samples");
const browserExecutable = process.env.REMOTION_BROWSER || null;

async function main() {
  if (templates.length === 0 || ratios.length === 0) throw new Error("No matching template or aspect ratio");
  const serveUrl = await bundle({ entryPoint: path.resolve("remotion/index.ts") });

  for (const template of templates) {
    for (const ratio of ratios) {
      const config = defaultConfig(template.slug);
      config.settings.aspectRatio = ratio;
      config.settings.brand = "Studio Contoh";
      const inputProps: ShowreelProps = { config, resolution: "720p", watermark: false };

      const composition = await selectComposition({ serveUrl, id: template.slug, inputProps, browserExecutable });
      const file = path.join(outDir, `${template.slug}-${ratio.replace(":", "x")}.mp4`);
      const started = Date.now();
      await renderMedia({
        serveUrl,
        composition,
        inputProps,
        codec: "h264",
        outputLocation: file,
        browserExecutable,
      });
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      console.log(
        `${template.slug} ${ratio}: ${composition.width}x${composition.height}, ` +
          `${(composition.durationInFrames / composition.fps).toFixed(1)}s video in ${seconds}s -> ${file}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
