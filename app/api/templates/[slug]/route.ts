import type { NextRequest } from "next/server";
import { route } from "@/lib/api/handler";
import { getTemplateDetail } from "@/lib/templates";

export const GET = route(async (_request: NextRequest, ctx: RouteContext<"/api/templates/[slug]">) => {
  const { slug } = await ctx.params;
  return Response.json(getTemplateDetail(slug));
});
