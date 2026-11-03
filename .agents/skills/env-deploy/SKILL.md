---
name: env-deploy
description: "InvoiceTrackr env vars, Docker build, CI, and Render deploys. Use when adding env vars or touching .env.example, Dockerfile, workflows, or deploy config."
---

# Env & Deploy (InvoiceTrackr)

## Environments

- **Local**: root `.env.local` copied from `.env.example`.
- **Production**: env vars on the Render web service `invoicetrackr`
  (Dashboard → service → Environment). Root `.env` is only a compatibility
  fallback.
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

Render builds the root `Dockerfile` from the repo and passes the service's
env vars to the build as Docker build args. `.dockerignore` excludes `.env*`.

So any `NEXT_PUBLIC_*` value read by browser code is inlined during
`next build` and needs:

1. `Dockerfile` — matching `ARG NAME` **and** `ENV NAME=${NAME}` in the
   `base` stage, before the client build;
2. the Render service env var, so the build arg has a value;
3. `.env.example` — documented for local setup.

Without the `ARG`/`ENV` pair the value stays `undefined` in browser chunks,
even when it is set on Render.

Server-only runtime values (database, Resend, webhooks, Cloudinary, server
PostHog keys, auth secrets) are Render env vars and only need
`.env.example` documentation, unless the build itself reads them.

## Adding a new env var — checklist

- [ ] Read it where the code already reads config (server: after
      `loadEnv()`; client: `process.env.NEXT_PUBLIC_*` only for public values)
- [ ] Add it to `.env.example` with a safe placeholder
- [ ] Public client value → `ARG`/`ENV` in `Dockerfile`
- [ ] Tell the user to add it to the Render service's Environment (don't do
      it yourself)
- [ ] E2E needs it? → add a placeholder in `e2e/scripts/run-local.mjs` and the
      CI e2e job env

## Deploy flow

1. CI (`.github/workflows/ci.yml`) runs the Playwright e2e job on `main`.
2. Render auto-deploys `main` only after the commit's CI checks pass, building
   the Docker image on Render.
3. The container starts `prod.sh`, which first runs `drizzle-kit migrate` from
   `/app/server`. A failing migration exits the container and fails the
   deploy (see the **drizzle-migration** skill).
4. `prod.sh` then starts the Fastify `dist/app.js` and the Next.js standalone
   server side by side. If either exits, the container exits so Render
   restarts it.
5. Render's health check path is `/icon.png`, a static file, so its frequent
   checks don't keep the Neon database awake. `/api/health` still reports
   Next.js, Fastify, and database status for manual checks.

The free instance spins down after 15 minutes without traffic and has no
zero-downtime deploys: the old instance stops before the new one serves.

## Operations

Health checks, error tracking, backups, restore steps, rollbacks, and secret
rotation are documented outside the repo, in the owner's Obsidian vault:
`~/Documents/Obsidian Vault/InvoiceTrackr/InvoiceTrackr Operations.md`.
Keep it current when any of those change.

## Local commands

- Dev: `pnpm dev` (builds shared types/emails/pdf, then watches everything).
- Migrations: confirm `.env.local` has the development `DATABASE_URL`, then
  `pnpm run server migrate`.
