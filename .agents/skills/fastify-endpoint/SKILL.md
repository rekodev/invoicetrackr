---
name: fastify-endpoint
description: "Add or change an InvoiceTrackr API endpoint across shared types, Fastify controller/options/routes, server messages, and the client api function and server action. Use for any backend route or request/response shape change, or when wiring UI to the server."
---

# Fastify Endpoint (InvoiceTrackr)

An endpoint here is a vertical slice across three packages. Missing a layer
usually compiles fine and fails at runtime (unregistered route, response
fields silently stripped by the serializer, untranslated message key), so
walk every layer below even for a "small" change.

The cleanest full reference is commit `0d1ace0` (REK-170, VMI company lookup).
Read its files when in doubt:
`git show 0d1ace0 --stat` then open the files listed in each step.

## Server file layout

Keep each concern in its own module, following the existing folders:

- `shared/types/src/<domain>.ts` — Zod schemas + inferred types.
- `server/src/controllers/<domain>.ts` — request handling only: parse
  params, call DB/services, map domain errors, send the response.
- `server/src/options/<domain>.ts` — schema, pre-handlers, rate limits.
- `server/src/routes/<domain>.ts` — paths only.
- `server/src/database/<domain>.ts` — Drizzle queries and transactions,
  scoped by `userId`.
- `server/src/utils/<domain>.ts` — pure logic (calculations, mappers,
  formatting) so it can be tested without Fastify or a database.
- `server/src/services/<name>/` — external integrations (HTTP APIs, email,
  storage) behind a small interface.
- `server/src/analytics/` — PostHog events.

Don't let a controller grow query or calculation logic inline; move it to
`database/` or `utils/`.

## 1. Contract — `shared/types/src/<domain>.ts`

- Import `z from 'zod/v4'`.
- Define request/body schemas and response schemas; export inferred types
  (`export type X = z.infer<typeof xSchema>`).
- Validation messages are **i18n keys**, not prose:
  `.min(1, 'validation.client.name')`. Each key must exist in
  `server/src/locales/{en,lt}.ts` under `validation` (see `i18n` skill).
- Body schemas usually carry `id: z.coerce.number().optional()` so one schema
  serves create, update, and response.
- Shared response wrappers live in `shared/types/src/response.ts`.
- Export new modules from `shared/types/src/index.ts`.

Why it matters: the response schema is used by `fastify-type-provider-zod` as
the serializer, so any field not in it is dropped from the JSON. If the client
"doesn't receive" a field, check the response schema first.

## 2. Controller — `server/src/controllers/<domain>.ts`

```ts
export const createThing = async (
  req: FastifyRequest<{ Params: { userId: string }; Body: ThingBody }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);

  const thing = await insertThingInDb(userId, req.body);
  if (!thing) throw new BadRequestError(i18n.t('error.thing.unableToCreate'));

  await recordRequestAudit({ req, userId, action: 'thing.created',
    entityType: 'thing', entityId: thing.id, newValue: thing });

  reply.status(201).send({ thing, message: i18n.t('success.thing.created') });
};
```

- Params arrive as strings; convert with `Number(...)`.
- Throw error classes from `server/src/utils/error.ts` (`BadRequestError`,
  `NotFoundError`, `ForbiddenError`, `ConflictError`, `InternalServerError`)
  with a translated message. The global `errorHandler` shapes the response
  as `{ message, errors, code }`, which the client relies on.
- User-visible success responses include `message: i18n.t('success.…')`;
  the client shows it in a toast.
- Mutations of business records record an audit event (`recordRequestAudit`)
  and, for meaningful product actions, a PostHog event via
  `captureAnalyticsEventForUser` + `analyticsEvents`. Follow what neighbouring
  controllers in the same domain do.
- DB access goes through `server/src/database/<domain>.ts`, always scoped by
  `userId`. Domain rule violations returned from the DB layer use exported
  string constants (e.g. `INVOICE_UPDATE_NOT_DRAFT`) that the controller maps
  to an error class.
- External services go behind `server/src/services/<name>/` (see
  `services/company-lookup/`), never inline `fetch` in the controller.

## 3. Route options — `server/src/options/<domain>.ts`

```ts
export const createThingOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: thingBodySchema,
    response: { 201: thingResponseSchema }
  },
  preHandler: [authMiddleware],
  handler: createThing
};
```

- Every `/api/:userId/...` route uses `authMiddleware`; it rejects with 401
  unless the token subject matches `:userId`, so handlers can trust the param.
- Actions that send email or issue documents also add `requireVerifiedEmail`
  or `requireVerifiedEmailWhenSending` (see `server/src/options/invoice.ts`).
- Add `config.rateLimit` for expensive or abusable endpoints (external
  lookups, email sending, public token routes).
- Public token routes (`/api/invoices/public/:token`) have no auth
  pre-handler; validate the token in the DB layer and never leak other
  users' data.

## 4. Route registration — `server/src/routes/<domain>.ts` and `server/src/app.ts`

- Add `fastify.<method>('/api/:userId/<resource>...', xOptions)` to the
  domain's route plugin. Register static paths (e.g. `/invoices/next-number`)
  before parameterised ones (`/invoices/:id`) in the same file.
- New route group: create the plugin and add `server.register(xRoutes)` in
  `server/src/app.ts` next to the others.

## 5. Server messages — `server/src/locales/{en,lt}.ts`

Add `success.*`, `error.*`, and any `validation.*` keys to **both** files with
natural Lithuanian. Server interpolation uses `%{name}`.

## 6. Tests

Extend the domain's existing controller test file
(`server/src/controllers/__tests__/<domain>.ts`) with the new route — see the
**testing** skill for the `createTestApp` pattern, global mocks (i18n
returns keys), and what cases to cover.

## 7. Client API function — `client/src/api/<domain>.ts`

```ts
import type { ThingBody, ThingResponse } from '@invoicetrackr/types';
import api from './api-instance';

export const createThing = async (userId: number, body: ThingBody) =>
  await api.post<ThingResponse>(`/api/${userId}/things`, body);
```

Client code imports **types only** from `@invoicetrackr/types` — never schemas.

## 8. Server action — `client/src/lib/actions/<domain>.ts`

```ts
'use server';

export const createThingAction = async ({ userId, thing }: {...}):
  Promise<ActionResponseModel> => {
  const response = await createThing(userId, thing);

  if (isResponseError(response)) {
    return {
      ok: false,
      message: response.data.message,
      code: response.data.code,
      validationErrors: mapValidationErrors(response.data.errors)
    };
  }

  revalidatePath(THINGS_PAGE);
  return { ok: true, message: response.data.message };
};
```

- Components call the action, never `api/` directly for mutations.
- `revalidatePath` every page that shows the changed data (page constants in
  `client/src/lib/constants/pages.ts`); invoice changes typically also
  revalidate the workspace and `CLIENTS_PAGE` layout.
- Server components may call `api/` functions directly for reads (see
  `app/(user)/clients/[clientId]/page.tsx`).

## Checklist before handoff

- [ ] Schema + inferred types exported from `shared/types/src/index.ts`
- [ ] Response schema includes every field the client reads
- [ ] Controller: i18n messages, correct status, error classes, userId scoping
- [ ] Audit/analytics where neighbouring mutations have them
- [ ] Options: auth pre-handler, response schema per status, rate limit if needed
- [ ] Route registered (and group registered in `app.ts`)
- [ ] `en` + `lt` server locale keys
- [ ] Controller coverage added via the **testing** skill
- [ ] Client `api/` function + server action + `revalidatePath`
