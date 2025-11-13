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

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL database (or Neon serverless account)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/invoicetrackr.git
cd invoicetrackr

# Install dependencies
pnpm install

# Set up environment variables
# Create .env files in both client/ and server/ directories
# (See Configuration section below)

# Run database migrations
pnpm run server generate
pnpm run server migrate

# Start development servers
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Configuration

#### Server (`server/.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-key
```

#### Client (`client/.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 📝 Available Scripts

### Root Level
- `pnpm run dev` - Start all services in development mode
- `pnpm run build` - Build all packages for production
- `pnpm run lint` - Lint all packages
- `pnpm run lint:fix` - Fix linting issues across all packages

### Client
- `pnpm run client dev` - Start Next.js dev server
- `pnpm run client build` - Build for production
- `pnpm run client start` - Start production server

### Server
- `pnpm run server dev` - Start Fastify dev server with hot reload
- `pnpm run server build` - Compile TypeScript to JavaScript
- `pnpm run server start` - Start production server
- `pnpm run server generate` - Generate database migrations
- `pnpm run server migrate` - Run database migrations

### Types
- `pnpm run types dev` - Watch and rebuild types
- `pnpm run types build` - Build shared types package

## 🏭 Production Deployment

### Docker

```bash
# Build the Docker image
docker build -t invoicetrackr .

# Run the container
docker run -p 3000:3000 -p 8080:8080 --env-file .env invoicetrackr
```

### Manual Deployment

```bash
# Build all packages
pnpm run build

# Start the server
cd server && pnpm start

# Start the client (in another terminal)
cd client && pnpm start
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

## 🧪 Testing

```bash
# Run linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

## 📄 License

Copyright (c) 2025 rekodev. All rights reserved.

This project is proprietary and confidential. See [LICENSE](LICENSE) for details.

## 👤 Author

**rekodev**

---

For questions or support, please open an issue on GitHub.
