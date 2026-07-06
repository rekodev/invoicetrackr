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
- Landing page no longer advertises Stripe Connect, card payment links, contracts, trial pricing, or small-business accounting as the primary product.
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
- Issued-invoice correction and credit-note draft creation has been removed from the MVP surface and schema.
- Contracts pages, routes, footer links, sitemap entries, and homepage placeholder copy have been removed.
- Recipient signing has been reframed as optional client acknowledgement instead of qualified electronic signing.
- VAT/PVM controls are hidden by default for non-VAT invoices while staying available for VAT payers and existing VAT invoices.
- Seller profile copy now targets individual activity certificate details instead of generic company details.
- Logged-in account settings are locked to EUR.
- Pricing cards, pricing navigation, pricing analytics, and trial query parameters have been removed until the MVP pricing model is decided.

## Remaining cleanup targets

### Recipient signing and contracts

Current code keeps handwritten recipient acknowledgement and sender visual signature surfaces:

- `client/src/app/invoices/sign/[token]/page.tsx`
- `client/src/components/invoice/signing/*`
- `client/src/components/signature-pad.tsx`
- `shared/emails/emails/invoice-signed-notification-email.tsx`
- signing fields and handlers in invoice server code

Decision: keep this as a practical client acknowledgement feature. Do not describe it as a qualified electronic signature. Provider-backed e-signatures such as Dokobit remain post-MVP.

### VAT/PVM default invoice workflow

Current code keeps VAT/PVM schema and calculations because individual activity can be VAT registered, but the default non-VAT workflow hides VAT inputs:

- `shared/types/src/invoice.ts`
- `server/src/utils/invoice.ts`
- invoice database columns for VAT rates, VAT totals, and exemption notes

Recommended next action: keep VAT support behind the profile-level VAT payer toggle and continue treating non-VAT invoices as the primary MVP path.

### Freelancer profile model

Current user/profile storage still uses generic field names:

- `businessType`
- `businessNumber`
- `vatNumber`

Recommended next action: keep the UI language focused on individual activity, then later rename storage fields only if the migration cost is justified.

### EUR-first financial reporting

The app is now EUR-only in account settings and defaults. Schema/storage can still hold a currency string for compatibility:

- invoice forms and shared types still support arbitrary currency values

Recommended next action: defer true foreign-currency invoices and EUR conversion history to post-MVP.
