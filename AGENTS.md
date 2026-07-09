# InvoiceTrackr Agent Guide

## Product Direction

InvoiceTrackr is a Lithuania-first finance and invoicing app for solo freelancers operating under individuali veikla pagal pažymą, with English as a polished secondary language. The public free invoice generator should demonstrate the quality of invoice output, while the logged-in product should sell saved workflow: invoice history, clients, bank accounts, numbering sequences, email sending, payment tracking, expenses, tax estimates, annual summaries, accountant exports, and billing continuity when the pricing model is decided.

Initial MVP priorities:

1. Lithuania-first VAT/PVM model.
2. Legally serious Lithuanian invoice PDF output.
3. Server-side invoice numbering and configurable series.
4. Invoice lifecycle with drafts, issued immutable snapshots, revisions, paid dates, and recovery/history.
5. Pajamu zurnalas export.
6. Manual bank-transfer payment tracking, reminders, expenses, tax estimates, annual summaries, and accountant exports.
7. PostHog product analytics, transactional email polish, SEO, and self-hosted operational readiness.

MVP non-goals include MB/UAB/company workflows, verslo liudijimas, payroll, employees, inventory, double-entry accounting, direct VMI submission, open banking, online invoice payment links, qualified e-signatures, multi-user/accountant portals, broad foreign-currency accounting, contracts, and subscription-first packaging. Future work can revisit these deliberately after the freelancer MVP is stable.

The live Linear document `Freelancer Finance MVP Roadmap` is the source of truth for MVP ordering, scope, completed checklist state, and post-MVP backlog. Treat local dated audit docs as stale unless the live Linear roadmap confirms them.

## Repository Overview

This is a `pnpm` monorepo.

- `client`: Next.js app using the App Router, server components, server actions, HeroUI, Tailwind CSS, and `next-intl`.
- `server`: Fastify API with Drizzle/Postgres, Zod validation, i18n, Resend, Cloudinary, and rate limiting.
- `shared/types`: Shared Zod schemas and inferred TypeScript types.
- `shared/emails`: React Email templates.

## Working Workflow

- Start by reading existing code and matching local patterns.
- Keep changes scoped to the issue being worked.
- Prefer small, buildable changes over broad rewrites.
- Add or update tests when changing invoice math, schemas, API contracts, auth, billing, or PDF behavior.
- Do not run linting, typechecking, testing, or build commands before handoff unless explicitly requested.
- Stop after implementation and report that the code is ready for local user review/testing before committing or opening a PR.
- Do not make destructive git changes. Preserve unrelated user changes.

When validation is explicitly requested, prefer the narrowest useful command:

- Type-only repo check: `pnpm run typecheck`.
- Full repo check: `pnpm run verify`.
- Targeted server test: `pnpm --filter @invoicetrackr/server test:run -- <path>`.
- Targeted client test: `pnpm --filter @invoicetrackr/client test:run -- <path>`.

## Git, Linear, And PR Workflow

- Use conventional branch prefixes such as `feat/`, `fix/`, and `chore/`.
- Include the Linear issue ID in branch names, commit messages, PR titles, and PR descriptions.
- Use PR titles in the format `[REK-48] Add invoice domain foundation`.
- PR descriptions should start with `### Overview`, followed by a short summary and bullet points of key changes.
- Do not add standalone `Validation:`, `Refs`, test-plan, typecheck, lint, migration-journal, locale-JSON, whitespace-check, or skipped-check notes to PR descriptions. CI and reviewer workflows own validation visibility.
- Let the user review and test locally before creating commits or pull requests.
- Linear PR auto-linking requires the Linear GitHub integration. Without it, issue IDs are plain text references.
- Check local `gh auth status` early for publish work. If GitHub connector writes fail, use the authenticated local `gh` CLI for PR creation and updates.

## Type Safety And Validation

- Server validation uses Zod schemas from `@invoicetrackr/types`.
- Client code imports inferred types only. Do not import Zod schemas into the client.
- Shared body schemas usually have optional `id` fields so they can support create and response shapes.
- Response schemas live in `shared/types/src/response.ts`.
- Keep schema, database, API, action, and UI types aligned in the same change when contract shape changes.

Example:

```ts
// Server: schemas and types are allowed.
import { invoiceBodySchema, InvoiceBody } from '@invoicetrackr/types';

// Client: types only.
import { InvoiceBody } from '@invoicetrackr/types';
```

## Next.js Client Guidelines

- Use server components by default.
- Use client components only for interactivity.
- Mutations should go through server actions or existing action hooks, not direct component API calls.
- Follow existing HeroUI and layout conventions.
- Prefer HeroUI theme tokens and variants over custom colors, gradients, or background treatments; the theme should handle most light/dark styling.
- When unsure how to implement a HeroUI component or API, fetch the current HeroUI v3 docs before coding. Most controls should use HeroUI's built-in styling and variants without extra custom styling.
- Keep client-side validation minimal; authoritative validation belongs on the server.
- Locale behavior should respect explicit cookie choice and logged-in user settings. The intended MVP behavior is Lithuanian for Lithuanian visitors and English otherwise.
- For HeroUI forms with React Hook Form, prefer `Controller` for controlled HeroUI fields. HeroUI `Select` callbacks should be handled as selected-key values, not DOM events.
- HeroUI wrapper props belong on the wrapper component: for example, `TextField` owns `isDisabled`.
- Quote Next.js paths containing route groups or dynamic segments in zsh commands.

## Fastify Server Guidelines

New or changed endpoints should follow the existing structure:

1. Controller in `server/src/controllers`.
2. Schema/type changes in `shared/types/src`.
3. Route options in `server/src/options`, including response schemas and auth pre-handlers.
4. Route registration in `server/src/routes`.
5. App registration in `server/src/app.ts` if adding a new route group.

Use the existing auth middleware, error classes, i18n messages, and response status conventions:

- `200` for GET, PUT, DELETE success.
- `201` for POST creation success.

Controller tests should usually register the real route options/schema with `createTestApp` and `mockAuthMiddleware`, then mock the database module. This keeps validation behavior covered without touching the real database.

## Environment Workflow

- Local development should use a root `.env.local` copied from `.env.example`.
- Do not edit production secrets to switch local databases.
- Server runtime and Drizzle commands load env files from the workspace root, even when commands run from `server/`.
- Outside production, root `.env.local` is loaded before root `.env`; real shell/process env vars still take precedence.
- Production should use VPS process env vars. Root `.env` is only a compatibility fallback.
- Production deploys build the Docker image in GitHub Actions and load it into Dokku with `git:load-image`; Dokku config is runtime-only for that already-built image.
- `.dockerignore` excludes `.env*`, so production client build-time values must come from GitHub Actions secrets passed as Docker build args.
- Any `NEXT_PUBLIC_*` value read by client/browser code during `next build` must be present in both `.github/workflows/ci.yml` as a `--build-arg` and in `Dockerfile` as matching `ARG` plus `ENV` before the client build runs. Runtime-only Dokku config is not enough for browser chunks.
- Server-only runtime values such as database, Resend, webhooks, and server PostHog keys can remain Dokku/VPS process env vars unless they are needed during the Docker build.
- For local migrations, confirm `.env.local` contains the development `DATABASE_URL`, then run `pnpm run server migrate`.

## Invoice Domain Rules

- Draft invoices may be edited freely.
- Issued invoices should become immutable snapshots.
- Fixing an issued invoice should use a revision/correction flow rather than silently overwriting the issued document.
- Track issue date, due date, paid date, and document state separately.
- VAT/PVM should support no VAT, 21%, 0%, and custom per-line rates for MVP.
- Prefer VAT-exclusive line input for logged-in Lithuanian workflows, with calculated subtotal, VAT total, and grand total.
- Invoice numbering should be generated server-side by user and series, with uniqueness and concurrency safety.
- Multiple series per user should be supported.
- Qualified e-signature integration should come after immutable document snapshots exist.

## Billing And Growth Rules

- The MVP pricing model is not final; do not foreground trials, subscription-first packaging, pricing cards, or online payment promises unless the live Linear roadmap says they are back in scope.
- Logged-in MVP should be EUR-first. USD can remain for free/demo or future international workflows if it does not complicate core Lithuanian invoicing.
- Payments are manual bank-transfer records in the MVP. Online invoice payment links and open banking are post-MVP unless explicitly pulled back into scope.
- Analytics direction: PostHog for product funnels, consent-aware tracking, and key server-side events.

## Linear

Current Linear workspace is `rekodev`, project is `InvoiceTrackr`, and the existing team key is `REK`. Issue identifiers come from the Linear team key, not the project name. If project-specific issue IDs are desired, rename the team key in Linear settings or create/use an `InvoiceTrackr` team with key `INV`.

The current roadmap document is `Freelancer Finance MVP Roadmap` (`ae430e3e-e7bc-4817-b042-a858ad336e28`). Read it before answering “what is next,” changing roadmap scope, or updating issue status.

Use the direct `mcp__linear` connector for live Linear reads and writes when available; `mcp__codex_apps__linear` can be stale or require reauthentication. Move Linear issues to `Done` only after merge or explicit user confirmation.
