---
name: env-deploy
description: "InvoiceTrackr env vars, Docker build, CI, and Dokku deploys. Use when adding env vars or touching .env.example, Dockerfile, workflows, or deploy config."
---

# Env & Deploy (InvoiceTrackr)

## Environments

- **Local**: root `.env.local` copied from `.env.example`. Never edit
  production secrets to point local code at another database.
- **Production**: VPS process env vars managed by Dokku (`dokku config`).
  Root `.env` is only a compatibility fallback.
- **E2E**: env is hard-coded in `e2e/scripts/run-local.mjs` and the CI e2e
  job; it only ever targets the disposable `invoicetrackr_e2e` database.

## How env files load

`server/src/config/env.ts` → `loadEnv()` finds the workspace root (the folder
with `pnpm-workspace.yaml`) even when commands run from `server/`, then:

- non-production: root `.env.local`, then root `.env`;
- production: root `.env` only.

`dotenv` never overrides variables already set in the shell/process, so real
env vars always win. `server/drizzle.config.ts` uses the same loader, so
Drizzle commands read root env files too.

## Build-time vs runtime values

Production deploys build the Docker image in GitHub Actions and load it into
Dokku with `git:load-image`. Dokku config applies only at runtime to that
already-built image, and `.dockerignore` excludes `.env*`.

So any `NEXT_PUBLIC_*` value read by browser code is inlined during
`next build` and must be passed at **build time**, in three places:

1. `.github/workflows/ci.yml` — `--build-arg NAME=${{ secrets.NAME }}` in the
   "Build Docker image" step (and the GitHub secret must exist);
2. `Dockerfile` — matching `ARG NAME` **and** `ENV NAME=${NAME}` in the
   `base` stage, before the client build;
3. `.env.example` — documented for local setup.

Setting it only in Dokku leaves it `undefined` in browser chunks.

Server-only runtime values (database, Resend, webhooks, Cloudinary, server
PostHog keys, auth secrets) stay as Dokku/VPS env vars and only need
`.env.example` documentation, unless the build itself reads them.

## Adding a new env var — checklist

- [ ] Read it where the code already reads config (server: after
      `loadEnv()`; client: `process.env.NEXT_PUBLIC_*` only for public values)
- [ ] Add it to `.env.example` with a safe placeholder
- [ ] Public client value → build arg in `ci.yml` + `ARG`/`ENV` in `Dockerfile`
- [ ] Server value → tell the user to set it with `dokku config:set` on the
      VPS (don't do it yourself)
- [ ] E2E needs it? → add a placeholder in `e2e/scripts/run-local.mjs` and the
      CI e2e job env
- [ ] Never print secret values in logs, responses, commits, or PRs

## Deploy flow

1. CI (`.github/workflows/ci.yml`) runs checks and the Playwright e2e job.
2. "Build and deploy" builds the image with build args, then pipes
   `docker image save` over SSH to `dokku git:load-image invoice-app …`.
3. Dokku runs the `app.json` **predeploy** hook: `drizzle-kit migrate` from
   `/app/server`. A failing migration blocks the deploy (see the
   **drizzle-migration** skill).
4. The container starts `prod.sh`: Next.js standalone server and the
   Fastify `dist/app.js` side by side.

## Local commands

- Dev: `pnpm dev` (builds shared types/emails/pdf, then watches everything).
- Migrations: confirm `.env.local` has the development `DATABASE_URL`, then
  `pnpm run server migrate`. If the target database is ambiguous, ask first.

Don't install dependencies, run migrations, or change environment state
without a clear need, and never switch production configuration for local
testing.
