# InvoiceTrackr Agent Guide

## Product

InvoiceTrackr is a Lithuania-first invoicing and finance app for solo freelancers under individuali veikla pagal pažymą. Lithuanian is the primary language and English a polished secondary. The public free invoice generator shows off output quality; the logged-in product sells saved workflow: invoice history, clients, numbering series, sending, manual bank-transfer payment tracking, expenses, tax estimates, annual summaries, and accountant exports.

The live Linear document **Freelancer Finance MVP Roadmap** is the source of truth for MVP scope and order (see the `linear-git` skill).

MVP non-goals: MB/UAB/company workflows, verslo liudijimas, payroll, inventory, double-entry accounting, direct VMI submission, open banking, online payment links, qualified e-signatures, multi-user/accountant portals, broad multi-currency accounting, and subscription-first packaging (no trials, pricing cards, or online payment promises). Logged-in MVP is EUR-first. Don't introduce these as side effects. Analytics is PostHog: product funnels, consent-aware tracking, and key server-side events.

## Repository

`pnpm` monorepo:

- `client`: Next.js App Router, server components and server actions, HeroUI v3, Tailwind CSS, `next-intl`.
- `server`: Fastify, Drizzle/Postgres, Zod, fastify-i18n, Resend, Cloudinary, rate limiting.
- `shared/types`: Zod schemas and inferred types. `shared/emails`: React Email. `shared/pdf`: invoice PDF.
- `e2e`: Playwright.

## Always

- Client code imports only **types** from `@invoicetrackr/types`, never Zod schemas.
- Issued invoices are immutable legal documents; invoice numbers are allocated server-side. Read the `invoice-domain` skill before touching invoices, totals, payments, or PDFs.
- Every user-facing string ships in both `lt` and `en`.
- Mutations go through server actions, not direct API calls from components.
- Never edit production secrets or point local commands at the production database.

## Skills

| Task | Skill |
| --- | --- |
| API endpoint, request/response shape, server file layout | `fastify-endpoint` |
| Invoices, VAT/PVM, numbering, payments, income journal, PDF | `invoice-domain` |
| UI work in `client/` and splitting features into files | `frontend` + `heroui-react` |
| Schema change or migration | `drizzle-migration` |
| Any user-facing copy or locale behaviour | `i18n` |
| Writing or extending tests (Vitest, Playwright) | `testing` |
| Env vars, Docker, CI, Dokku deploys | `env-deploy` |
| Branches, commits, PRs, Linear issues, roadmap | `linear-git` |
