import { decodeCursor, encodeCursor, type Page } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import type { ListTemplatesQuery, TemplateDetail, TemplateSummary } from "@/lib/contracts/templates";
import { TEMPLATE_CATALOG } from "@/remotion/catalog";
import type { TemplateMeta } from "@/remotion/shared/template";

// Fase 0 reads the code catalog (remotion/catalog.ts). Once the Template table is seeded, this module switches to
// Prisma and the route handlers stay as they are.

const NEW_FOR_MS = 30 * 24 * 60 * 60 * 1000;

function toSummary(t: TemplateMeta, now: number): TemplateSummary {
  const published = new Date(t.publishedAt);
  return {
    slug: t.slug,
    name: t.name,
    description: t.description,
    type: t.type,
    isPremium: t.isPremium,
    isNew: now - published.getTime() < NEW_FOR_MS,
    publishedAt: published.toISOString(),
    previewUrl: null,
    thumbnailUrl: null,
  };
}

export function listTemplates(query: ListTemplatesQuery, now = Date.now()): Page<TemplateSummary> {
  const q = query.q?.toLowerCase();
  const matching = TEMPLATE_CATALOG.filter(
    (t) =>
      (!query.type || t.type === query.type) &&
      (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
  );

  let startIndex = 0;
  if (query.cursor) {
    const position = decodeCursor(query.cursor);
    const after = typeof position?.after === "string" ? position.after : null;
    const index = after ? matching.findIndex((t) => t.slug === after) : -1;
    if (index === -1) throw new ApiError("VALIDATION_ERROR", "Cursor tidak valid.", [{ path: "cursor", message: "Unknown cursor" }]);
    startIndex = index + 1;
  }

  const slice = matching.slice(startIndex, startIndex + query.limit);
  const hasMore = startIndex + query.limit < matching.length;
  return {
    data: slice.map((t) => toSummary(t, now)),
    nextCursor: hasMore ? encodeCursor({ after: slice[slice.length - 1].slug }) : null,
  };
}

export function getTemplateDetail(slug: string, now = Date.now()): TemplateDetail {
  const template = TEMPLATE_CATALOG.find((t) => t.slug === slug);
  if (!template) throw new ApiError("NOT_FOUND", `Template "${slug}" tidak ditemukan.`);
  return {
    ...toSummary(template, now),
    params: Object.entries(template.params).map(([key, spec]) => ({
      key,
      label: spec.label,
      min: spec.min,
      max: spec.max,
      step: spec.step,
      default: spec.default,
      unit: spec.unit ?? null,
    })),
  };
}
