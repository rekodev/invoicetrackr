# InvoiceTrackr

A modern, full-stack invoice management application built with Next.js, Fastify, and TypeScript.

## 🚀 Features

- **Invoice Management** - Create, track, and manage invoices
- **Banking Integration** - Manage banking information and payment details
- **User Authentication** - Secure authentication with NextAuth.js
- **Internationalization** - Multi-language support (English, Lithuanian)
- **PDF Generation** - Generate professional invoice PDFs
- **Real-time Updates** - WebSocket support for live data
- **Payment Processing** - Stripe integration for payments
- **Responsive Design** - Modern UI with HeroUI and Tailwind CSS

## 🏗️ Tech Stack

### Frontend (`client/`)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: HeroUI + Tailwind CSS
- **State Management**: React Hook Form
- **Charts**: Chart.js
- **PDF**: React PDF Renderer
- **Payments**: Stripe
- **Testing**: Vitest with React Testing Library

### Backend (`server/`)
- **Framework**: Fastify 5
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Validation**: Zod with fastify-type-provider-zod
- **Authentication**: Custom JWT implementation
- **File Upload**: Cloudinary
- **Email**: Resend
- **WebSockets**: ws
- **Testing**: Vitest with in-memory SQLite

### Shared (`shared/`)
- **Types** (`shared/types/`): Zod schemas and TypeScript types shared between client and server (with validation error messages)
- **Emails** (`shared/emails/`): Email templates built with React Email, providing type-safe, component-based email designs

## 📦 Project Structure

```
invoicetrackr/
├── client/              # Next.js frontend application
│   ├── src/
│   │   ├── components/__tests__/  # Component unit tests
│   │   └── test/                  # Test utilities and setup
│   └── vitest.config.ts
├── server/              # Fastify backend API
│   ├── src/
│   │   ├── controllers/__tests__/ # API endpoint tests
│   │   └── test/                  # Test factories and setup
│   └── vitest.config.ts
├── shared/
│   ├── types/          # Shared Zod schemas and TypeScript types
│   └── emails/         # Email templates built with React Email
├── .github/
│   └── workflows/      # CI/CD pipelines
├── Dockerfile          # Production Docker configuration
└── pnpm-workspace.yaml # Monorepo workspace configuration
```

## 🔧 Architecture Highlights

## Environment Variables

Local development should use a root `.env.local` file. Start from the
committed template:

```sh
cp .env.example .env.local
```

Server and Drizzle commands load environment variables from the workspace root,
so they behave the same whether they are run from the repo root or `server/`.
Outside production, `.env.local` is loaded before `.env`; existing shell
environment variables still take precedence.

Production should provide secrets through the VPS process environment. The root
`.env` file is still loaded as a compatibility fallback, but local development
should not edit production values to switch databases.

For local migrations, set the development `DATABASE_URL` in `.env.local`, then
run:

```sh
pnpm run server migrate
```

### Type Safety
- Zod schemas defined in `shared/types/` are the single source of truth
- Server uses Zod for runtime validation
- Client imports inferred TypeScript types (no runtime validation)
- Automatic type safety across the entire stack
- `pnpm dev` builds `@invoicetrackr/types` once before starting dev servers.
  The shared types package then runs in watch mode, and client/server dev
  servers are configured to pick up rebuilt package output from
  `shared/types/dist`.

### API Structure
- Controllers handle business logic (`server/src/controllers/`)
- Options define route schemas and configuration (`server/src/options/`)
- Routes register endpoints (`server/src/routes/`)
- Centralized error handling with i18n support

### Monorepo Benefits
- Shared type definitions between frontend and backend
- Coordinated builds and deployments
- Centralized linting and formatting rules
- Efficient dependency management with pnpm workspaces

### Testing Strategy
- **Server Tests**: Vitest with in-memory SQLite database for API endpoint testing
  - Test factories using Fishery for generating test data
  - Complete isolation with per-test-suite seeding and rollback
  - Mocked external services (Stripe, Resend, Cloudinary)
- **Client Tests**: Vitest with React Testing Library for component testing
  - Tests focus on client components with user interaction logic
  - Mocked Next.js router, cookies, and server actions
  - Internationalization wrapper for consistent i18n testing
- **Type Safety**: Shared Zod schemas ensure consistency across test environments
- **CI/CD**: Automated testing in GitHub Actions for all pull requests

## 📄 License

Copyright (c) 2025 rekodev. All rights reserved.

This project is proprietary and confidential. See [LICENSE](LICENSE) for details.

## 👤 Author

**rekodev**

---

For questions or support, please open an issue on GitHub.
