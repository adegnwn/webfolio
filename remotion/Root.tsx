import { Composition } from "remotion";
import { compositionMetadata, defaultConfig } from "./composition";
import { ShowreelConfig, type ShowreelProps } from "./shared/config";
import { FPS } from "./shared/dimensions";
import { TEMPLATES } from "./registry";

export function RemotionRoot() {
  return (
    <>
      {TEMPLATES.map((template) => (
        <Composition
          key={template.slug}
          id={template.slug}
          component={template.component}
          fps={FPS}
          defaultProps={
            {
              config: defaultConfig(template.slug),
              resolution: "1080p",
              watermark: false,
            } satisfies ShowreelProps
          }
          // Render input comes from the queue, so it is validated here before any frame is drawn.
          calculateMetadata={({ props }) => {
            const config = ShowreelConfig.parse(props.config);
            return { ...compositionMetadata({ config, resolution: props.resolution }), props: { ...props, config } };
          }}
        />
      ))}
    </>
  );
}
