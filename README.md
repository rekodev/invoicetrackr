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

### Backend (`server/`)
- **Framework**: Fastify 5
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Validation**: Zod with fastify-type-provider-zod
- **Authentication**: Custom JWT implementation
- **File Upload**: Cloudinary
- **Email**: Resend
- **WebSockets**: ws

### Shared (`shared/types/`)
- **Type Safety**: Zod schemas shared between client and server
- **Validation**: Centralized schema definitions

## 📦 Project Structure

```
invoicetrackr/
├── client/              # Next.js frontend application
├── server/              # Fastify backend API
├── shared/
│   └── types/          # Shared Zod schemas and TypeScript types
├── .github/
│   └── workflows/      # CI/CD pipelines
├── Dockerfile          # Production Docker configuration
└── pnpm-workspace.yaml # Monorepo workspace configuration
```

## 🔧 Architecture Highlights

### Type Safety
- Zod schemas defined in `shared/types/` are the single source of truth
- Server uses Zod for runtime validation
- Client imports inferred TypeScript types (no runtime validation)
- Automatic type safety across the entire stack

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

## 📄 License

Copyright (c) 2025 rekodev. All rights reserved.

This project is proprietary and confidential. See [LICENSE](LICENSE) for details.

## 👤 Author

**rekodev**

---

For questions or support, please open an issue on GitHub.
