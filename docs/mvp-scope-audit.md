# InvoiceTrackr MVP Scope Audit

Date: 2026-07-06

## Product focus

InvoiceTrackr MVP is now scoped to Lithuanian freelancers operating under individuali veikla pagal pazyma. The app should prioritize:

- non-VAT standard invoice creation for individual activity by default
- reusable clients and freelancer profile details
- invoice PDF generation and email sending
- manual bank-transfer payment tracking
- reminders, expenses, tax estimates, annual summaries, and accountant exports

The MVP should not sell or foreground MB, UAB, verslo liudijimas, payroll, employees, inventory, double-entry accounting, direct VMI submission, Stripe Connect, client card payments, contracts, or subscription-first packaging.

## Cleaned up in this pass

- Public homepage and SEO copy now frame the product around Lithuanian individual activity freelancers.
- Landing page no longer advertises Stripe Connect, card payment links, contracts, Premium trials, or small-business accounting as the primary product.
- Signed-in top navigation no longer exposes Contracts.
- Profile navigation no longer exposes Billing or Invoice Payments.
- Auth/session payloads no longer include subscription, trial, or billing-success state.
- Onboarding and authenticated routing no longer depend on Stripe subscription/trial state.
- The logged-in layout no longer runs billing/subscription sync on every authenticated route.
- Terms and privacy copy have been narrowed away from subscription-first, online-payment, and contracts-first promises.
- Saved-invoice payment settings now expose only manual bank transfer or no payment block.
- Public invoice links resolve to bank-transfer instructions instead of Stripe Checkout.
- Legacy Billing, Renew Subscription, Invoice Payments, and Payment Success pages have been removed.
- Stripe Checkout, Stripe Connect, Stripe webhook handling, subscription entitlement middleware, and Stripe payment database helpers have been removed.
- Stripe account, webhook, subscription, trial, invoice checkout, and payment intent columns/tables are removed by migration.
- Shared API types and tests were narrowed to manual payment mode.

## Remaining cleanup targets

### Recipient signing and contracts

Current code still contains post-MVP signing/contract surfaces:

- `client/src/app/(user)/contracts/page.tsx`
- `client/src/app/invoices/sign/[token]/page.tsx`
- `client/src/components/invoice/signing/*`
- `client/src/components/signature-pad.tsx`
- `shared/emails/emails/invoice-signed-notification-email.tsx`
- signing fields and handlers in invoice server code

Recommended next action: remove signing from invoice send/detail flows, keep visual signature only if needed for generated PDFs, and move true e-signatures to post-MVP.

### Correction and credit-note workflow

Current invoice code still contains issued-document correction concepts that may be too complex for the freelancer MVP unless they are reviewed as legally correct flows.

Recommended next action: keep immutable issued invoice snapshots, but hide or remove user-facing correction and credit-note workflows. The MVP fallback can be "cancel and duplicate as a new draft" until a proper accountant-reviewed correction flow is designed.

### VAT/PVM default invoice workflow

Current code still exposes VAT/PVM controls throughout the invoice flow:

- `client/src/components/invoice/invoice-services-table.tsx`
- `client/src/components/invoice/invoice-form.tsx`
- `client/src/components/invoice/free-invoice-form.tsx`
- `client/src/components/pdf/pdf-document.tsx`
- `shared/types/src/invoice.ts`
- `server/src/utils/invoice.ts`
- invoice database columns for VAT rates, VAT totals, and exemption notes

Recommended next action: keep schema extensibility, but hide VAT controls in the default MVP invoice editor unless a future VAT mode is explicitly enabled.

### Freelancer profile model

Current user/profile model still looks like a generic business profile:

- `businessType`
- `businessNumber`
- `vatNumber`
- generic company/person labels in profile and client forms

Recommended next action: refactor the primary profile language and validation around full legal name, individual activity certificate number, address, invoice email, phone, IBAN, bank name, invoice prefix, and default payment term.

### EUR-first financial reporting

The app still exposes broader currency settings:

- `client/src/lib/constants/profile.tsx` includes USD in account settings
- invoice forms and shared types still support arbitrary currency values

Recommended next action: lock logged-in MVP reporting to EUR while preserving original-currency fields only where needed for future foreign-currency support.
