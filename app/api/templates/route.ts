import { parseQuery, route } from "@/lib/api/handler";
import { ListTemplatesQuery } from "@/lib/contracts/templates";
import { listTemplates } from "@/lib/templates";

export const GET = route(async (request: Request) => {
  const query = parseQuery(request, ListTemplatesQuery);
  return Response.json(listTemplates(query));
});
