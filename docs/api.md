# ShowForge API contract

The types in `lib/contracts/*.ts` are the source of truth; this page is the readable index. An endpoint is written here before it is built, and changes are additive (new optional fields), never renames or removals.

Status as of Fase 0: only the template endpoints are implemented. Everything else is contract only and lands in Fase 1.

## Conventions

| Topic | Rule |
|---|---|
| Paths | Plural nouns, no verbs: `/api/projects`, `/api/renders`. Sub-resources for relations: `/api/templates/{slug}/star`. |
| Casing | JSON fields camelCase. API enums UPPER_SNAKE (`SHOWREEL`, `FHD_1080`). Values inside `ShowreelConfig` keep the PRD's lowercase (`"4:5"`, `"crop"`, `"flood"`) because the config is a stored document, not an API enum. |
| Validation | Only in route handlers, with the zod schemas from `lib/contracts`. Services receive typed data. |
| Auth | Clerk session cookie (Fase 1). Every endpoint except `GET /api/templates*` and the payment webhook returns `401 UNAUTHENTICATED` without a session. Another user's resource returns `404`, not `403`, so ids cannot be probed. |
| Dates | ISO 8601 strings in UTC. |
| Media URLs | Stored configs reference uploads as `media:<id>`. Responses replace them with signed R2 URLs valid for 1 hour. |

### Errors

Every non-2xx response has this body:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Data yang dikirim tidak valid.", "details": [{ "path": "limit", "message": "Too big: expected number to be <=100" }] } }
```

`code` is stable and machine-readable; `message` is Indonesian and safe to show; `details` is optional and code-specific.

| Code | Status | When |
|---|---|---|
| `INVALID_JSON` | 400 | Body is not JSON |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | `POST /api/renders` without `Idempotency-Key` |
| `UNAUTHENTICATED` | 401 | No session |
| `INVALID_SIGNATURE` | 401 | Payment webhook signature check failed |
| `QUOTA_EXCEEDED` | 402 | No render quota/credits or storage left. `details: { needed, available }` |
| `FORBIDDEN` | 403 | Signed in but not allowed |
| `PLAN_REQUIRED` | 403 | Resolution, format or premium template not in the user's plan. `details: { requiredPlan }` |
| `NOT_FOUND` | 404 | Resource missing or not yours |
| `CONFLICT` | 409 | State does not allow the action (e.g. deleting media used by a running render) |
| `PAYLOAD_TOO_LARGE` | 413 | Upload above 64 MB (image) or 100 MB (video) |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Upload type outside JPG, PNG, WEBP, AVIF, MP4, WEBM, MOV |
| `VALIDATION_ERROR` | 422 | Body or query fails its schema. `details: [{ path, message }]` |
| `IDEMPOTENCY_KEY_REUSED` | 422 | Same `Idempotency-Key` with a different body |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Anything unexpected. Never includes internals |

### Pagination

Every list endpoint takes `?cursor=&limit=` (`limit` 1 to 100, default 20) and returns:

```json
{ "data": [], "nextCursor": "eyJhZnRlciI6InJpc2UifQ" }
```

`nextCursor` is opaque and `null` on the last page. A cursor this API did not issue is a `422 VALIDATION_ERROR`.

## Endpoints

### Templates (built)

| Method | Path | Body / query | Success |
|---|---|---|---|
| GET | `/api/templates` | `type?=SHOWREEL\|LOOP`, `q?`, `cursor?`, `limit?` | 200 `Page<TemplateSummary>` |
| GET | `/api/templates/{slug}` | | 200 `TemplateDetail` (includes `params[]` for the settings controls; a param with `options` is a choice whose value is the option index), 404 |
| PUT | `/api/templates/{slug}/star` | | 204. Idempotent |
| DELETE | `/api/templates/{slug}/star` | | 204. Idempotent |

### Projects (Fase 1)

| Method | Path | Body / query | Success |
|---|---|---|---|
| GET | `/api/projects` | `type?`, `sort?=UPDATED_DESC\|UPDATED_ASC\|NAME_ASC`, `cursor?`, `limit?` | 200 `Page<ProjectSummary>` |
| POST | `/api/projects` | `{ name?, templateSlug, config? }` or `{ name?, duplicateOf }` | 201 `ProjectDetail` |
| GET | `/api/projects/{id}` | | 200 `ProjectDetail` |
| PATCH | `/api/projects/{id}` | `{ name?, config? }`, at least one | 200 `ProjectDetail` |
| DELETE | `/api/projects/{id}` | | 204. Soft delete, idempotent |

Free plan: the fourth project returns `402 QUOTA_EXCEEDED` (PRD 7.2: 3 projects).

### Uploads and media (Fase 1)

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/api/uploads` | `{ projectId, fileName, mimeType, sizeBytes }` | 201 `{ media, upload: { url, method: "PUT", headers, expiresAt } }` |
| PATCH | `/api/media/{id}` | `{ status: "READY", width?, height?, durationMs? }` | 200 `Media`. Server checks the object exists in R2 first |
| DELETE | `/api/media/{id}` | | 204. Idempotent |

The browser PUTs the file straight to R2 with the returned URL and headers; the file never passes through Next.js.

### Renders (Fase 1)

| Method | Path | Body / query | Success |
|---|---|---|---|
| POST | `/api/renders` | Header `Idempotency-Key`. `{ projectId, resolution, format? }` | 202 `Render` (new), 200 `Render` (same key, same body) |
| GET | `/api/renders` | `projectId?`, `cursor?`, `limit?` | 200 `Page<Render>` |
| GET | `/api/renders/{id}` | | 200 `Render`. Polled every 2 s while `PENDING`/`PROCESSING` |

Idempotency: the client creates one key per click on Render and reuses it for retries. The server claims the key by inserting the Render row (unique on `userId + idempotencyKey`), so two concurrent retries cannot both start a render or both charge credits. The project config is copied into `Render.configSnapshot` at that moment.

Charging: plan quota first, then purchased credits (1080p = 1 credit, 4K = 3). The charge is written in the same transaction as the Render row; a failed render writes a `REFUND` ledger entry.

### Payment webhooks (Fase 2)

| Method | Path | Success |
|---|---|---|
| POST | `/api/webhooks/payment/midtrans` | 200 |
| POST | `/api/webhooks/payment/stripe` | 200 |

The handler verifies the signature (`401 INVALID_SIGNATURE`), inserts a `PaymentEvent` keyed on `(provider, externalId)`, and returns 200 straight away for an event it has already seen. Processing (subscription update, credit purchase) happens once per event, in a transaction with the ledger write.
