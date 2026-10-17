# ShowForge

Turns screenshots and clips into a portfolio showreel. Spec: the ShowForge PRD (Portfolio Showreel SaaS) in the WEB FOLIO SAAS project.

Status: **Fase 0 done, Fase 1 in progress.** The editor runs six templates (showreels Comet, Rise, Slide, Snap, Stack and the loop Marquee) in light and dark mode. Media can be added (picker or drag and drop), removed and reordered; until R2 upload lands they stay in the browser tab as local files. Accounts, upload, export and payments are next.

## Stack

Next.js 16 (App Router) · Tailwind CSS 4 + shadcn/ui · Remotion 4 (templates, Player preview, rendering) · Zustand (editor state) · Prisma 7 + Supabase Postgres · planned: Clerk, Cloudflare R2, BullMQ + Upstash, Remotion Lambda.

Two decisions that differ from the PRD's first suggestion:

- **Preview uses Remotion Player, not Framer Motion.** The canvas plays the same composition the renderer uses, so preview and output cannot drift apart (PRD risk R2) and each template is written once.
- **Uploads go to R2 by presigned URL, not UploadThing.** UploadThing stores files in its own storage, which would contradict the R2 architecture in PRD 6.3.

## Getting started

```bash
npm install            # also runs prisma generate
npm run dev            # http://localhost:3000 -> /dashboard
```

Node 22 or newer.

## Database (one-time)

1. Create a Supabase project and copy `.env.example` to `.env`.
2. Fill `DATABASE_URL` (pooled, port 6543, append `?pgbouncer=true`) and `DIRECT_URL` (direct, port 5432) from Supabase > Project Settings > Database.
3. Create the first migration and load the templates:

```bash
npm run db:migrate -- --name init   # creates prisma/migrations/<timestamp>_init and applies it
npm run db:seed                     # syncs the Template table with remotion/catalog.ts
```

Commit the generated `prisma/migrations` folder. Later environments (production) use `npm run db:deploy`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Route types + TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest: API contract and template tests |
| `npm run remotion:studio` | Remotion Studio for working on templates frame by frame |
| `npm run render:samples` | Renders every template at 16:9, 9:16 and 4:5 (720p) into `out/samples/`. `-- rise 1:1` for one |
| `npm run db:migrate` / `db:deploy` / `db:seed` | Prisma migrations and template seed |

## Deploy preview to Vercel

1. Push this repo to GitHub.
2. In Vercel: Add New > Project > import the repo. The framework preset (Next.js) and the default build settings work as they are.
3. Environment variables: none needed for Fase 0. Add `DATABASE_URL` once the database is in use.
4. Every push to a branch then gets its own preview URL.

## Layout

```
app/
  (dashboard)/dashboard/   editor (PRD 5.2)
  api/templates/           GET list + detail (the only endpoints built so far)
components/
  editor/                  TemplatePanel, Canvas (Remotion Player + drop zone), MediaStrip, SettingsPanel
  ThemeToggle.tsx          light/dark switch; lib/theme.ts applies the choice before first paint
  ui/                      shadcn/ui components, themed with DESIGN.md tokens
lib/
  api/                     error format, cursor pagination, boundary validation
  contracts/               zod schemas + types for every endpoint (built and planned)
  db.ts, env.ts            Prisma client (driver adapter), lazy env validation
  templates.ts             template queries behind /api/templates
  media-files.ts           file format/size checks (PRD 3.2) and reading picked files
stores/
  editor.ts                the ShowreelConfig being edited (Zustand)
  ui.ts                    panel visibility, media errors
remotion/
  catalog.ts               which templates exist (metadata only, safe for server code)
  registry.ts              catalog + React components
  composition.ts           default config, size and duration per config
  shared/                  ShowreelConfig schema, dimensions, timeline, Stage, MediaFrame, Ending
  templates/<slug>/        one folder per template: component + params/timing (or layout for loops)
prisma/
  schema.prisma, seed.ts
docs/api.md                API contract and conventions
DESIGN.md                  visual direction and tokens
```

## Adding a template

1. `remotion/templates/<slug>/timing.ts`: declare its options with `ParamSpecs` and its duration.
2. `remotion/templates/<slug>/<Name>.tsx`: the composition, wrapped in `<Stage>`, using `MediaFrame` for each item.
3. Add it to `remotion/catalog.ts` (metadata) and `remotion/registry.ts` (component).
4. `npm run render:samples -- <slug>` to check it, then `npm run db:seed`.

The settings panel builds the template's sliders from its `ParamSpecs`, so no UI code is needed.

Loop templates (`type: "LOOP"`) have no ending, set `usesHoldDuration: false` when there is no resting moment, and must return exactly one motion cycle from `durationInFrames` so the last frame flows into frame 0. `tests/loops.test.ts` shows how to prove that for a template.
