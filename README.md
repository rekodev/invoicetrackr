# InvoiceTrackr

Invoicing and finance for Lithuanian solo freelancers working under
_individuali veikla pagal pažymą_. Lithuanian is the primary language, with
English as a full second language.

## Features

- **Free invoice generator** on the public site, with PDF download
- **Invoices**: drafts, server-allocated numbering series, issuing, voiding,
  PDF export, sending by email, reminders, public view links and recipient
  signing
- **Payments**: manual bank-transfer payments recorded against invoices,
  overdue tracking
- **Clients**: client records with company lookup from the VMI open-data
  register
- **Expenses**: expenses with receipts and deductibility
- **Reports**: income and expense journal, tax estimates, a "safe to spend"
  figure and an annual tax package export
- **Account**: Google or email login, email verification, data export and
  account deletion

## Tech stack

| Area | Stack |
| --- | --- |
| Web app (`client/`) | Next.js 16 (App Router, server actions), React 19, HeroUI v3, Tailwind CSS 4, next-intl, Auth.js, React Hook Form, Chart.js |
| API (`server/`) | Fastify 5, Drizzle ORM on PostgreSQL (Neon), Zod, fastify-i18n, rate limiting |
| Shared (`shared/`) | `types`: Zod schemas and inferred types; `emails`: React Email templates; `pdf`: invoice PDF with React PDF |
| Services | Resend (email and delivery webhooks), Cloudinary (files), PostHog (product analytics and error tracking) |
| Tests | Vitest and React Testing Library (client), Vitest with Fastify `inject` (server), Playwright (`e2e/`) |

## Repository layout

```
invoicetrackr/
├── client/          Next.js web app
├── server/          Fastify API, Drizzle schema and migrations
├── shared/
│   ├── types/       Zod schemas and TypeScript types
│   ├── emails/      React Email templates
│   └── pdf/         Invoice PDF document
├── e2e/             Playwright tests and disposable test database setup
├── Dockerfile       Production image (web app and API in one container)
├── prod.sh          Starts both processes in the container
└── app.json         Dokku predeploy migrations and health check
```

Zod schemas in `shared/types` are the single source of truth. The API
validates with them at runtime; the web app imports only the inferred types.

## Getting started

Requirements: Node.js 22, pnpm (via Corepack), and a PostgreSQL database
(a Neon development branch works well).

```sh
corepack enable
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`, then apply migrations and start everything:

```sh
pnpm run server migrate
pnpm dev
```

`pnpm dev` builds the shared packages once, then watches them alongside the
API and the web app on <http://localhost:3000>.

On macOS, port 5000 is often taken by AirPlay Receiver. If the API fails to
start, set `SERVER_PORT` to another port.

### Environment variables

Local development uses the root `.env.local`; `.env.example` lists every
variable. Server and Drizzle commands load environment files from the
workspace root, so they behave the same from the repo root or `server/`.
Outside production, `.env.local` is loaded before `.env`, and shell variables
take precedence over both.

Production secrets come from the server's process environment. Never point
local commands at the production database.

Google login uses Auth.js. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, and
allow these redirect URIs on the Google OAuth client:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run the web app, API and shared package watchers |
| `pnpm lint` | Lint the web app and API |
| `pnpm typecheck` | Build shared packages and typecheck the web app and API |
| `pnpm build` | Production build of every package |
| `pnpm run server generate` | Generate a Drizzle migration from schema changes |
| `pnpm run server migrate` | Apply migrations to the database in `.env.local` |
| `pnpm run client test:run` / `pnpm run server test:run` | Run unit tests once |
| `pnpm test:e2e` | Run Playwright against a disposable Docker database |

## Testing

- **Web app**: component tests with React Testing Library, using mocked
  server actions and a next-intl wrapper.
- **API**: controller tests through Fastify `inject`, with the database
  layer and external services (Resend, Cloudinary, PostHog) mocked and
  Fishery factories for test data.
- **End to end**: `pnpm test:e2e` starts PostgreSQL in Docker, syncs the
  schema, installs Chromium if needed, runs the suite and removes the
  database. Database preparation refuses non-local targets. Use
  `pnpm test:e2e:headed` or `pnpm test:e2e:ui` to debug.

GitHub Actions typechecks, lints, builds and unit-tests every pull request,
and runs the Playwright suite on pull requests and on `main`.

## Deployment

Pushes to `main` run the Playwright suite, then build the Docker image and
deploy it to a Dokku host. Dokku applies database migrations before each
release (`app.json`) and checks `/api/health` before switching traffic.

## License

Copyright (c) 2025 rekodev. All rights reserved.

This project is proprietary. See [LICENSE](LICENSE) for details.
