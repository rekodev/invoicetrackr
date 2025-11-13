# Copilot Instructions

## Repository Overview

- **Type:** `pnpm` monorepo  
- **Folders:**  
  - `client`: Next.js app using the App Router, server components, and server actions.  
  - `server`: Node.js app using the Fastify framework, includes internationalization and related features.
  - `shared/types`: Shared Zod schemas and types used by both client and server.

---

## Generation Guidelines

- **Conciseness:** Prefer concise code over verbose explanations.  
- **Comments:** Do not add comments unless they clarify complex logic.
- **Style:** Infer code style, naming conventions, and structure from existing files rather than predefined rules.  
- **Consistency:** Match existing folder and file organization patterns (e.g., component placement, utility structure).  
- **Dependencies:** Suggest adding new dependencies only if absolutely necessary. Prefer native or existing library solutions.  
- **Performance:** Prioritize efficient, idiomatic code — avoid unnecessary re-renders, deep prop drilling, or redundant states.  
- **TypeScript:** Always use strict, type-safe patterns. Infer types from existing code whenever possible.
- **Clarification:** If the request is ambiguous or lacks context, ask for more details before generating code.

---

## Validation & Type Safety

- **Client:** NO validation on the client. All validation happens on the server.
- **Server:** Uses Zod for schema validation (migrated from TypeBox).
- **Shared Types:** Import schemas and inferred types from `@invoicetrackr/types` package.
  - Server imports both **schemas** (for validation) and **types** (for TypeScript).
  - Client imports only **types** (inferred from Zod schemas).

### Schema Naming Conventions

- **Body schemas:** `userBodySchema`, `invoiceBodySchema` - Used for both request and response validation. All body schemas have `id` field as optional, making them suitable for both creating new records (omit `id`) and returning existing records (include `id`).
- **Response schemas:** `getUserResponseSchema`, `postInvoiceResponseSchema` - Defined in `shared/types/src/response.ts` and composed from body schemas.

Example:
```typescript
// Server imports schemas + types
import { userBodySchema, getUserResponseSchema, User } from '@invoicetrackr/types';

// Client imports only types
import { User, GetUserResponse } from '@invoicetrackr/types';
```

**Note:** Get schemas have been removed. Body schemas with optional `id` fields are used everywhere.

---

## HTTP Status Codes

- **200:** Success for GET, PUT, DELETE operations
- **201:** Success for POST (creation) operations
- Controllers should return appropriate status codes using Fastify's `reply.code(201).send(...)`

---

## Next.js (Client)

- Use **server components** by default unless interactivity is required.  
- **Server actions** should handle mutations and return serializable data.  
- Keep **client components** focused on UI logic — no direct API calls; delegate that to actions or hooks.  
- Follow existing **UI component patterns** (styling library: hero-ui, layout conventions, etc.).
- **No validation** on client - all validation is server-side.
- Import types from `@invoicetrackr/types` - never import Zod schemas on the client.

---

## Fastify (Server)

- Register new routes under their logical plugin (e.g., `routes/user.ts`).  
- Use **Zod schemas** from `@invoicetrackr/types` for validation.
- Return appropriate **HTTP status codes** (200 for updates/deletes, 201 for creates).
- Use existing utilities for **auth checks** and **error handling**.

---

## ESLint Configuration

- **Root:** `eslint.config.js` - Contains shared ESLint rules for the entire monorepo.
- **Client:** `client/eslint.config.js` - Extends root config, adds Next.js specific rules.
- **Server:** `server/eslint.config.js` - Extends root config, adds Node.js best practices.
- Shared rules are defined once in root and extended by client/server configs.

---

## Server: Creating New Endpoints (Fastify)

To create a new API endpoint, follow this step-by-step process:

### 1. Define the Controller
- **Path:** `server/src/controllers`  
- Each controller file corresponds to a domain (e.g., `invoice.ts`).  
- If adding to an existing domain (like invoices), open that file and define a new controller following the existing examples.  
- If creating a new domain (e.g., `payment`), create a new file following the naming conventions found in this folder.  
- Controllers should export functions (handlers) that match the existing structure and style.
- **Return correct status codes:** Use `reply.code(201)` for POST operations, `reply.code(200)` for others.

### 2. Define Schemas in Shared Types (if needed)
- **Path:** `shared/types/src/`  
- If creating a new entity, define schemas in the appropriate file (e.g., `shared/types/src/invoice.ts`).
- Create **body schema** with optional `id` field:
  - `entityBodySchema` - Used for both request and response validation
  - Make `id` field optional: `id: z.number().optional()`
- Define response schemas in `shared/types/src/response.ts`:
  - `getEntityResponseSchema` - For GET endpoints (composes body schema)
  - `postEntityResponseSchema` - For POST endpoints (composes body schema)
  - `updateEntityResponseSchema` - For PUT endpoints (composes body schema)
- Export inferred types for client usage.

### 3. Define the Options
- **Path:** `server/src/options`  
- Each controller requires an **options** definition that specifies how Fastify should handle the route.  
- The options file (e.g., `invoice.ts`) defines:  
  - **Schema** (request/response validation using Zod)  
  - **Response schema** (imported from `@invoicetrackr/types`)
  - **Pre-handler** (middleware, e.g., authentication)  
  - **Handler** (the controller itself)
- If the endpoint requires authentication, include the `authMiddleware` as a pre-handler.
- Import response schemas from `@invoicetrackr/types` (e.g., `getUserResponseSchema`).

Example:
```typescript
export const getUserOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: getUserResponseSchema
    }
  },
  preHandler: authMiddleware,
  handler: getUser
};
```

### 4. Define the Route
- **Path:** `server/src/routes`  
- Create or update a route file matching your domain (e.g., `invoice.ts`).  
- Import the controller and options, and register the route following the existing examples.  

### 5. Register the Route Group
- **Path:** `server/src/app.ts`  
- If the new route group isn't registered yet, import and register it.  
- Route groups are often exported through **barrel exports** (e.g., `index.ts`) — this pattern is currently used throughout the project but may be refactored later.  
- Make sure the route group is properly registered so Fastify recognizes your new endpoints.  

After completing these steps, your endpoint will be live on the server and accessible through the defined route.

---

## Client: Consuming Endpoints

To call the new API from the frontend, follow these steps:

### 1. Define the API Function
- **Path:** `client/src/api`  
- Create or update a file corresponding to your domain (e.g., `invoice.ts`).  
- Define the API call function using existing examples as templates.  
- Follow the established naming conventions and ensure all imports match the existing structure.
- Import response types from `@invoicetrackr/types` (NOT schemas).

Example:
```typescript
import { GetUserResponse, User } from '@invoicetrackr/types';

export const getUser = async (id: number) =>
  await api.get<GetUserResponse>(`/api/users/${id}`);
```

### 2. Use the API
- Import and call the API function wherever needed in your components or server actions.  
- Prefer calling API functions from **server actions** when performing mutations.  
- For data fetching, reuse or extend existing hooks and caching logic where appropriate.  
- **No validation needed** on client - server handles all validation and returns typed responses.

Once these steps are completed, your endpoint will be fully integrated — accessible on the server and ready for use on the client.

---

## Shared Types Package (`@invoicetrackr/types`)

### Structure
- `shared/types/src/user.ts` - User-related schemas and types
- `shared/types/src/invoice.ts` - Invoice-related schemas and types
- `shared/types/src/client.ts` - Client-related schemas and types
- `shared/types/src/bank-account.ts` - Bank account schemas and types
- `shared/types/src/response.ts` - All API response schemas
- `shared/types/src/common.ts` - Common/shared schemas

### Usage
- **Server:** Imports both schemas (for validation) and types
- **Client:** Imports only inferred types (never imports Zod schemas)
- All schemas use **Zod v4** for validation
- Response types are inferred from response schemas using `z.infer<typeof schemaName>`
