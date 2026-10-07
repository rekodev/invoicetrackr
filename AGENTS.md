# InvoiceTrackr Agent Guide

## Product

InvoiceTrackr is a Lithuania-first invoicing and finance app for solo freelancers under individuali veikla pagal pažymą. Lithuanian is the primary language and English a polished secondary. The public free invoice generator shows off output quality; the logged-in product sells saved workflow: invoice history, clients, numbering series, sending, manual bank-transfer payment tracking, expenses, tax estimates, annual summaries, and accountant exports.

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
- UI reuses existing patterns (cards, section headers, tables, chips, alerts, tooltips) before inventing new ones; see the `frontend` skill's pattern catalog.
- Never edit production secrets or point local commands at the production database.
- Commits made through Claude Code run `.claude/hooks/pre-commit-checks.mjs`. It typechecks the affected packages and lints the staged files, and skips both if they already passed for the same content. Run it ahead of time with `node .claude/hooks/pre-commit-checks.mjs --run`. If it blocks a commit, fix the reported errors and retry. Tests are left to CI.

## Skills

| Task | Skill |
| --- | --- |
| API endpoint, request/response shape, server file layout | `fastify-endpoint` |
| Invoices, VAT/PVM, numbering, payments, income journal, PDF | `invoice-domain` |
| UI work in `client/` and splitting features into files | `frontend` + `heroui-react` |
| Any form, form dialog, or form test | `forms` |
| Schema change or migration | `drizzle-migration` |
| Any user-facing copy or locale behaviour | `i18n` |
| Writing or extending tests (Vitest, Playwright) | `testing` |
| Env vars, Docker, CI, Dokku deploys | `env-deploy` |
| Branches, commits, PRs, issue IDs | `linear-git` |
