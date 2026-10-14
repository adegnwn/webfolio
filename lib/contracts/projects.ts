import { z } from "zod";
import { PageQuery } from "@/lib/api/pagination";
import { ShowreelConfig } from "@/remotion/shared/config";
import { TemplateType } from "./templates";

// Contract only. Implemented in Fase 1 (week 8: project system).

/** GET /api/projects (PRD 5.3: filter Semua/Showreel/Loop, urut Terbaru/Terlama/Nama) */
export const ListProjectsQuery = PageQuery.extend({
  type: TemplateType.optional(),
  sort: z.enum(["UPDATED_DESC", "UPDATED_ASC", "NAME_ASC"]).default("UPDATED_DESC"),
});
export type ListProjectsQuery = z.infer<typeof ListProjectsQuery>;

/** POST /api/projects. With duplicateOf, the source project's config is copied and templateSlug/config are ignored. */
export const CreateProjectInput = z.union([
  z.object({
    name: z.string().trim().min(1).max(80).optional(),
    templateSlug: z.string().min(1),
    config: ShowreelConfig.optional(),
  }),
  z.object({
    name: z.string().trim().min(1).max(80).optional(),
    duplicateOf: z.string().min(1),
  }),
]);
export type CreateProjectInput = z.infer<typeof CreateProjectInput>;

/** PATCH /api/projects/{id}: only the fields sent are changed. */
export const UpdateProjectInput = z
  .object({
    name: z.string().trim().min(1).max(80),
    config: ShowreelConfig,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Kirim minimal satu field untuk diubah.");
export type UpdateProjectInput = z.infer<typeof UpdateProjectInput>;

export type ProjectSummary = {
  id: string;
  name: string;
  templateSlug: string;
  templateType: TemplateType;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & {
  /** media[].src is resolved to signed URLs (valid 1 hour) in responses. */
  config: ShowreelConfig;
};
