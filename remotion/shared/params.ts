import { z } from "zod";

/**
 * Template-specific options are declared once as data. The same declaration produces
 * the zod schema (validation + defaults), the JSON schema stored in Template.paramSchema,
 * and the controls in the settings panel (a slider, or a toggle group when `options` is set).
 */
export type ParamSpec = {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: "deg" | "x" | "%";
  /** A choice instead of a range: value i means options[i]. Values stay numbers in the config. */
  options?: readonly string[];
};

/** A named choice, stored as its index (0, 1, ...). */
export function choiceParam(label: string, options: readonly string[], defaultIndex = 0): ParamSpec {
  return { label, min: 0, max: options.length - 1, step: 1, default: defaultIndex, options };
}

export type ParamSpecs = Record<string, ParamSpec>;

export function paramsSchema<S extends ParamSpecs>(specs: S) {
  const shape = Object.fromEntries(
    Object.entries(specs).map(([key, s]) => {
      const n = s.options ? z.number().int() : z.number();
      return [key, n.min(s.min).max(s.max).default(s.default)];
    }),
  ) as { [K in keyof S]: z.ZodDefault<z.ZodNumber> };
  return z.object(shape);
}

export function paramDefaults(specs: ParamSpecs): Record<string, number> {
  return Object.fromEntries(Object.entries(specs).map(([k, s]) => [k, s.default]));
}

/** JSON schema for Template.paramSchema; keeps the UI hints next to the ranges. */
export function paramsJsonSchema(specs: ParamSpecs) {
  return {
    type: "object",
    additionalProperties: false,
    properties: Object.fromEntries(
      Object.entries(specs).map(([k, s]) => [
        k,
        {
          type: "number",
          minimum: s.min,
          maximum: s.max,
          default: s.default,
          title: s.label,
          "x-step": s.step,
          ...(s.unit ? { "x-unit": s.unit } : {}),
          ...(s.options ? { "x-options": s.options } : {}),
        },
      ]),
    ),
  };
}
