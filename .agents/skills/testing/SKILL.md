---
name: testing
description: "Where and how InvoiceTrackr tests are written: Vitest server and client tests and Playwright E2E, plus run commands. Use whenever writing, extending, or fixing tests in this repo."
---

# Testing (InvoiceTrackr)

Apply the global **test-design** skill first: extend existing tests before
adding new ones, combine checks that share a setup or journey, and keep small
table-driven tests for critical logic (money, numbering, lifecycle guards,
permissions, parsing). This skill covers where tests live here and the local
mechanics.

Write tests; don't run them unless the user asks. At handoff, name the
narrowest command (see **Running**).

## Finding the existing home

Before writing anything, search for a test that already builds the state you
need:

- `rg -l "<route path or component name>" server/src client/src e2e`
- Server controller tests are grouped per domain:
  `server/src/controllers/__tests__/<domain>.ts` (note: **no `.test`
  suffix** on server tests). Add new routes of that domain to this file.
- Client tests sit next to the component:
  `client/src/components/<domain>/__tests__/<component>.test.tsx`.
- E2E journeys: `e2e/*.spec.ts`. `e2e/invoices.spec.ts` already covers
  draft creation, recipient completion → issued, and recording/settling/
  editing payments through to "Paid" in the list — extend those journeys
  rather than starting new ones that redo the same setup.

## Server (Vitest, node)

Config: `server/vitest.config.ts` includes `**/__tests__/**/*.ts`, setup
`server/src/test/setup.ts`.

Global mocks from setup — don't re-mock these:
- `fastify-i18n`: `i18n.t(key)` returns the **key**, so assert
  `message: 'success.client.created'`, not English text.
- Cloudinary, Resend (`mockResendSend`), audit persistence
  (`mockCreateAuditEvent`), and email-delivery reads.
- `vi.clearAllMocks()` runs before each test.

**Controller tests** — register the real route options so Zod validation and
response serialization are exercised, swap auth for `mockAuthMiddleware`, and
mock the domain database (or service) module:

```ts
vi.mock('../../database/thing');

const app = await createTestApp((fastifyApp) => {
  fastifyApp.post('/api/:userId/things', {
    ...createThingOptions,
    preHandler: mockAuthMiddleware
  });
});
const response = await app.inject({ method: 'POST', url: '/api/1/things', payload });
expect(response.statusCode).toBe(201);
expect(response.json()).toEqual({ thing, message: 'success.thing.created' });
expect(thingDb.insertThingInDb).toHaveBeenCalledWith(1, expect.objectContaining({ … }));
await app.close();
```

Typical split for a route (merge into existing tests where the setup
matches): success (status + full response shape + DB args), validation
failure (400 and DB not called — use `it.each` for several bad inputs),
domain error/not-found, and one real-`authMiddleware` 401 per route group if
none exists yet (register `@fastify/cookie`). Response-schema stripping is
worth asserting when a payload could leak fields.

**Utils / domain logic** — `server/src/utils/__tests__/<name>.ts`. Money,
VAT, numbering, and date logic get table-driven tests with exact decimal
strings.

**Database helpers** — `server/src/database/__tests__/` for pure helpers
exported from DB modules (e.g. `summarizeInvoicePayments`,
`assertPaymentFits`). There is no real database in Vitest.

**Factories** — `server/src/test/factories/{invoice,client,user,banking-information}.ts`.
When a schema gains a required field, update the factory so every test
picks it up.

## Client (Vitest, jsdom)

Config: `client/vitest.config.ts` includes `**/__tests__/**/*.{ts,tsx}`,
setup adds jest-dom and cleans up + clears mocks after each test.

- Render with `withIntl(<Component />)` (or `renderHelper`) from
  `@/test/with-intl`; it loads `client/messages/en.json`, so assert English.
- Mock server actions with `vi.hoisted` + `vi.mock('@/lib/actions/<domain>', …)`
  and assert the call arguments plus the UI reaction (toast, field error,
  dialog closing).
- Stub heavy child widgets (e.g. `company-lookup-panel`) with a minimal fake.
- Drive the UI with `userEvent` and query by role/label.
- Write journey-style tests per scenario: "opens dialog, prefills, saves,
  shows toast, closes" is one test; the failure branch is another.
- Pure helpers in `client/src/lib/utils` get tests in
  `client/src/lib/utils/__tests__/`.
- When a shared type gains a required field, update client test fixtures
  (`client/src/test/*-fixtures.ts` and inline fixtures) in the same change.

## E2E (Playwright)

E2E covers real flows through Next.js + Fastify + Postgres. Use it for
journeys Vitest can't prove (issuing, recipient links, persistence across
pages); keep edge cases in Vitest. Setup is expensive, so extending an
existing journey is almost always better than a new test.

```
playwright.config.ts        # projects: setup → chromium; baseURL :3100; workers 1
e2e/
  setup/auth.setup.ts       # recreates + logs in the E2E freelancer, saves storage state
  fixtures/test.ts          # `test` extended with page-object fixtures; re-exports expect
  pages/*.page.ts           # page objects (InvoiceFormPage, InvoicesPage, …)
  utils/test-data.ts        # e2eUser, create<Thing>TestData factories
  invoices.spec.ts          # specs at e2e/*.spec.ts
  scripts/run-local.mjs     # docker DB → build shared pkgs → drizzle push → playwright
```

- Import `test`/`expect` from `./fixtures/test`. Every test starts logged in
  as the seeded freelancer.
- One shared database and user, serial workers: **isolate by data**. Create
  records with a unique-suffix factory (`createInvoiceTestData('Scenario', …)`)
  and find rows by that text (`rowFor(recipientName)`); never rely on counts
  or "the first row".
- Reusable multi-step flows belong in page-object methods (existing page
  object first; a new `e2e/pages/<name>.page.ts` registered in
  `fixtures/test.ts` only when a new screen needs one). One-off steps can
  stay in the spec.
- Select by role and accessible name (`getByRole('button', { name: 'Copy Link' })`,
  `getByLabel(…)`, `exact: true` when names overlap). A missing label is
  usually an accessibility bug worth fixing in the UI.
- Browser locale is `en-US` and the seeded user's language is `en`: assert
  copy from `client/messages/en.json`.
- Web-first assertions (`toBeVisible`, `toHaveURL`, `toContainText`,
  `expect.poll`); no `waitForTimeout`.
- Second actors (recipient, public viewer) get their own
  `browser.newContext({ locale: 'en-US' })`, closed in `finally`.
- Specs may import server DB helpers for setup/verification the UI can't
  reach; drive the UI for the behaviour under test.
- Seed changes: `auth.setup.ts` recreates the freelancer each run (profile,
  onboarding, analytics consent declined). Extend it or create state per
  test with unique data — never rely on leftovers.

## Running

Only when asked.

- Server file: `pnpm --filter @invoicetrackr/server test:run -- src/controllers/__tests__/client.ts`
- Client file: `pnpm --filter @invoicetrackr/client test:run -- src/components/client/__tests__/client-form-dialog.test.tsx`
- E2E: `pnpm test:e2e` (starts disposable Docker Postgres on :55432, builds
  shared packages, `drizzle-kit push`, runs Playwright, tears down). Extra
  args pass through: `pnpm test:e2e e2e/invoices.spec.ts -g "issues the draft"`.
  Debug with `pnpm test:e2e:headed` / `pnpm test:e2e:ui`. Don't run
  `playwright test` directly locally — it skips the database setup.
- Types after contract changes: `pnpm run typecheck`.

The E2E prepare script refuses anything but the local `invoicetrackr_e2e`
database; never point E2E env at a real database.
