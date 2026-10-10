---
name: invoice-domain
description: "InvoiceTrackr invoice business rules: lifecycle and immutability, numbering, VAT/PVM and money math, payments, income journal, and PDFs. Use before changing anything that touches invoices."
---

# Invoice Domain (InvoiceTrackr)

InvoiceTrackr is for Lithuanian solo freelancers (individuali veikla pagal
pažymą). An issued invoice is a legal document: once issued its number,
content, currency, and language must not silently change. Most rules below
exist to protect that guarantee, so when a change seems to require bending
one, stop and explain the tradeoff to the user instead of working around it.

MVP non-goals (MB/UAB workflows, payment links, open banking, direct VMI
submission, qualified e-signatures, multi-currency accounting) should not be
introduced as side effects.

## Where the rules live

| Concern | File |
| --- | --- |
| Schemas, enums, issue-time validation | `shared/types/src/invoice.ts`, `payment.ts`, `finance.ts` |
| Totals math (server, authoritative) | `server/src/utils/invoice.ts` → `calculateInvoiceTotals` |
| Totals math (PDF) | `shared/pdf/src/calculations.ts` |
| Cents helpers | `server/src/utils/money.ts` (`toCents`, `fromCents`) |
| Numbering, issue, draft-only updates | `server/src/database/invoice.ts` |
| Payments + balance | `server/src/database/invoice-payment.ts` |
| DB constraints | `server/src/database/schema.ts` (`invoicesTable` checks) |
| PDF document | `shared/pdf/src/pdf-document.tsx`, `messages-{lt,en}.json` |

Read the relevant file before changing behaviour; the notes below are a map,
not a replacement.

## Two independent status fields

- `lifecycleStatus`: `draft` → `issued` → (`voided`). Document state.
- `status`: `pending` | `paid` | `canceled`. Payment state.

Keep them independent — a draft is never "paid", an issued invoice can be
pending or paid, a voided one is canceled. Dates are tracked separately too:
`date` (issue date on the document), `serviceDate`, `dueDate` (≥ `date`,
enforced by schema refine), `issuedAt`, `paidAt`, `voidedAt`.

## Drafts vs issued

- Only drafts can be deleted; the delete controller rejects anything else
  with `error.invoice.issuedImmutable`. The DB helper itself does not check,
  so keep the guard in the controller (or move it into the query) if you
  touch that path.
- Drafts are freely editable. `updateInvoiceInDb` returns
  `INVOICE_UPDATE_NOT_DRAFT` for anything else; the controller turns that
  into an error. Do not loosen this guard.
- Issuing (`issueInvoiceInDb`) runs in one transaction with `FOR UPDATE`:
  reserves a number if the draft has none, sets `lifecycleStatus = 'issued'`,
  freezes `currency` (EUR) and `documentLanguage` from the business profile,
  sets `issuedAt`, and revokes any open recipient-details link. Issuing an
  already issued invoice is idempotent (returns it unchanged).
- A DB check constraint enforces: drafts have `currency` and
  `documentLanguage` NULL; non-drafts have both set. A migration that adds
  frozen-at-issue fields should extend this same pattern.
- Issue-time completeness lives in `issuableInvoiceBodySchema` (receiver
  name, business number, address; bank details when payment mode is
  `manual`). Draft saving uses the looser `invoiceWriteBodySchema`.
- Fixing an issued invoice must go through an explicit correction/revision
  or void-and-reissue flow — never by editing the issued row. If the needed
  flow doesn't exist yet, say so and ask the user before building one.

## Numbering

- Numbers are `SERIES + digits`, series `^[A-Z]{2,8}$`
  (`invoiceNumberSeriesSchema`, `invoiceNumberSchema`); default series comes
  from `businessProfiles.defaultInvoiceSeries`.
- Allocation is server-side per `(userId, series)` in
  `invoice_number_sequences`, via an atomic
  `INSERT … ON CONFLICT DO UPDATE SET next_number = next_number + 1
  RETURNING` inside the issuing transaction. This is what makes it
  concurrency safe — never compute "max + 1" from the invoices table or in
  the client.
- `GET /invoices/next-number` is a **preview** only; it does not reserve.
- `(userId, invoiceId)` is unique (`invoices_user_invoice_id_key`).
- Numbers are assigned at issue, so drafts may have no number.

## VAT / PVM and money

- Lines are VAT-exclusive: `amount` (unit price, 2 dp) × `quantity` (4 dp),
  with optional per-line `vatRate` (0–100, 2 dp) and `vatExemptionReason`.
  Supported cases: no VAT (non-payer, `vatRate` absent), 21 %, 0 % (with an
  exemption reason), custom per line.
- Totals are computed on the server from the lines with bigint fixed-point
  math and half-up rounding **per line**, then summed: `subtotalAmount`,
  `vatAmount`, `totalAmount` as decimal strings. Client-sent totals are not
  trusted.
- Never use JS floats for money in business logic. Use the bigint helpers
  (`toCents`/`fromCents`, `parseScaledDecimal`) and keep amounts as strings
  across the API. If you change rounding in one totals implementation,
  change the PDF one to match and add tests to
  `server/src/utils/__tests__/invoice.ts`.
- Logged-in MVP is EUR-first; currency is frozen to `eur` at issue.

## Payments

- MVP payments are manual bank-transfer records (`method: 'bank_transfer'`)
  with a payment allocation to the invoice.
- Only issued invoices accept payments; amounts can't exceed the
  outstanding balance (`assertPaymentFits`) or be dated in the future.
  Domain failures are exported constants/errors (`PAYMENT_EXCEEDS_BALANCE`,
  `PAYMENT_FUTURE_DATE`, …) mapped to translated errors in the controller.
- After every payment change, `status`/`paidAt` are recomputed in the same
  transaction: fully paid → `paid` with `paidAt` = latest payment date;
  otherwise `pending`. Don't set `status = 'paid'` directly elsewhere.
- Cancelling an issued invoice (`cancelInvoiceWithoutPaymentsInDb`) voids it
  in one step: `status = 'canceled'`, `lifecycleStatus = 'voided'`. It is
  blocked once payments exist (`PAYMENT_CANCEL_BLOCKED`); the voided row
  stays as history and is never deleted.

## Income journal and PDFs

- The income and expense journal (pajamų ir išlaidų žurnalas) on
  `/reports` is what the freelancer hands to VMI / their accountant:
  `GET /api/:userId/journal` and `/journal/export` (CSV/XLSX), queries in
  `server/src/database/journal.ts`, math in `server/src/utils/journal.ts`,
  files in `server/src/utils/journal-export.ts`. Income is one row per
  payment allocation on an issued invoice, dated by payment date, with a
  pro-rated VAT share; expenses use the stored EUR `deductible_amount`;
  the net result is income excluding VAT minus deductible expenses.
  Changes to which records or amounts it includes are tax-relevant — call
  them out explicitly.
- The PDF is rendered from the stored invoice in its frozen
  `documentLanguage`. Lithuanian output should read as a legally serious
  "PVM sąskaita faktūra" / "Sąskaita faktūra" with seller/buyer codes,
  VAT codes when present, amount in words, and correct diacritics. PDF
  copy lives in `shared/pdf/src/messages-{lt,en}.json`, not the client
  message files.

## Tests

Changes to invoice math, schemas, numbering, lifecycle, payments, or PDF
output need tests. Use the **testing** skill; existing homes are
`server/src/utils/__tests__/invoice.ts` and `invoice-pdf.ts`,
`server/src/controllers/__tests__/invoice.ts` and `invoice-workspace.ts`,
`server/src/database/__tests__/invoice-payment.ts`, and
`e2e/invoices.spec.ts`.
