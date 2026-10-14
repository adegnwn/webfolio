import { z } from "zod";
import { PageQuery } from "@/lib/api/pagination";

export const TemplateType = z.enum(["SHOWREEL", "LOOP"]);
export type TemplateType = z.infer<typeof TemplateType>;

/** GET /api/templates */
export const ListTemplatesQuery = PageQuery.extend({
  type: TemplateType.optional(),
  q: z.string().trim().min(1).max(80).optional(),
});
export type ListTemplatesQuery = z.infer<typeof ListTemplatesQuery>;

export type TemplateSummary = {
  slug: string;
  name: string;
  description: string;
  type: TemplateType;
  isPremium: boolean;
  /** True for 30 days after publishedAt; drives the "Baru" label. */
  isNew: boolean;
  publishedAt: string;
  previewUrl: string | null;
  thumbnailUrl: string | null;
};

export type TemplateParam = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: "deg" | "x" | "%" | null;
};

/** GET /api/templates/{slug} */
export type TemplateDetail = TemplateSummary & {
  params: TemplateParam[];
};
