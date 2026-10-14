import { describe, expect, it } from "vitest";
import { GET as listRoute } from "@/app/api/templates/route";
import { GET as detailRoute } from "@/app/api/templates/[slug]/route";
import { decodeCursor, encodeCursor } from "@/lib/api/pagination";

const get = (path: string) => listRoute(new Request(`http://localhost${path}`));

describe("GET /api/templates", () => {
  it("returns the standard page shape", async () => {
    const res = await get("/api/templates");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.map((t: { slug: string }) => t.slug)).toEqual(["comet", "rise"]);
    expect(body.nextCursor).toBeNull();
  });

  it("pages with an opaque cursor", async () => {
    const first = await (await get("/api/templates?limit=1")).json();
    expect(first.data).toHaveLength(1);
    expect(first.nextCursor).toEqual(expect.any(String));

    const second = await (await get(`/api/templates?limit=1&cursor=${first.nextCursor}`)).json();
    expect(second.data[0].slug).toBe("rise");
    expect(second.nextCursor).toBeNull();
  });

  it("filters by type and search text", async () => {
    const loops = await (await get("/api/templates?type=LOOP")).json();
    expect(loops.data).toEqual([]);
    const rise = await (await get("/api/templates?q=naik")).json();
    expect(rise.data.map((t: { slug: string }) => t.slug)).toEqual(["rise"]);
  });

  it("rejects bad query params with VALIDATION_ERROR", async () => {
    const res = await get("/api/templates?limit=500&type=FOO");
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.map((d: { path: string }) => d.path).sort()).toEqual(["limit", "type"]);
  });

  it("rejects a cursor it did not issue", async () => {
    const res = await get(`/api/templates?cursor=${encodeCursor({ after: "nope" })}`);
    expect(res.status).toBe(422);
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/templates/{slug}", () => {
  const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });

  it("returns params for the settings panel", async () => {
    const res = await detailRoute(new Request("http://localhost/api/templates/comet") as never, ctx("comet"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.params.map((p: { key: string }) => p.key)).toEqual(["arcHeight", "entryAngle"]);
  });

  it("returns NOT_FOUND in the standard error shape", async () => {
    const res = await detailRoute(new Request("http://localhost/api/templates/x") as never, ctx("x"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: expect.any(String) } });
  });
});

describe("cursor encoding", () => {
  it("round-trips and rejects garbage", () => {
    expect(decodeCursor(encodeCursor({ after: "rise", n: 3 }))).toEqual({ after: "rise", n: 3 });
    expect(decodeCursor("not-a-cursor")).toBeNull();
  });
});
