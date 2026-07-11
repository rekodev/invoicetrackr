import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';

export const invoiceServicesTable = pgTable(
  'invoice_services',
  {
    id: serial().primaryKey().notNull(),
    invoiceId: integer('invoice_id').notNull(),
    description: text().notNull(),
    unit: varchar({ length: 255 }).notNull(),
    quantity: integer().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    vatRate: numeric('vat_rate', { precision: 5, scale: 2 })
      .default('0')
      .notNull(),
    vatExemptionReason: text('vat_exemption_reason')
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_services_invoice_id'
    }).onDelete('cascade')
  ]
);

export const invoicesTable = pgTable(
  'invoices',
  {
    date: date().notNull(),
    userId: integer('user_id').notNull(),
    senderId: integer('sender_id'),
    receiverId: integer('receiver_id'),
    subtotalAmount: numeric('subtotal_amount', {
      precision: 10,
      scale: 2
    })
      .default('0')
      .notNull(),
    vatAmount: numeric('vat_amount', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar({ length: 50 }).notNull(),
    lifecycleStatus: varchar('lifecycle_status', { length: 50 })
      .default('draft')
      .notNull(),
    dueDate: date('due_date').notNull(),
    invoiceId: varchar('invoice_id').notNull(),
    id: serial().primaryKey().notNull(),
    senderSignature: varchar('sender_signature', { length: 255 }).notNull(),
    receiverSignature: varchar('receiver_signature', { length: 255 }),
    bankAccountId: integer('bank_account_id'),
    recipientSigningToken: varchar('recipient_signing_token', {
      length: 255
    }),
    recipientSigningSentAt: timestamp('recipient_signing_sent_at', {
      withTimezone: true,
      mode: 'string'
    }),
    recipientSigningEmail: varchar('recipient_signing_email', { length: 255 }),
    recipientSigningCreatedAt: timestamp('recipient_signing_created_at', {
      withTimezone: true,
      mode: 'string'
    }),
    recipientSigningExpiresAt: timestamp('recipient_signing_expires_at', {
      withTimezone: true,
      mode: 'string'
    }),
    recipientSigningRevokedAt: timestamp('recipient_signing_revoked_at', {
      withTimezone: true,
      mode: 'string'
    }),
    recipientSigningRequestedAt: timestamp('recipient_signing_requested_at', {
      withTimezone: true,
      mode: 'string'
    }),
    recipientSignedAt: timestamp('recipient_signed_at', {
      withTimezone: true,
      mode: 'string'
    }),
    publicInvoiceToken: varchar('public_invoice_token', {
      length: 255
    }),
    publicInvoiceSentAt: timestamp('public_invoice_sent_at', {
      withTimezone: true,
      mode: 'string'
    }),
    publicInvoiceExpiresAt: timestamp('public_invoice_expires_at', {
      withTimezone: true,
      mode: 'string'
    }),
    publicInvoiceRevokedAt: timestamp('public_invoice_revoked_at', {
      withTimezone: true,
      mode: 'string'
    }),
    paymentMode: varchar('payment_mode', { length: 50 })
      .default('manual')
      .notNull(),
    manualPaymentReference: text('manual_payment_reference'),
    issuedAt: timestamp('issued_at', {
      withTimezone: true,
      mode: 'string'
    }),
    paidAt: timestamp('paid_at', {
      withTimezone: true,
      mode: 'string'
    }),
    voidedAt: timestamp('voided_at', {
      withTimezone: true,
      mode: 'string'
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [invoiceSendersTable.id],
      name: 'fk_invoices_invoice_senders'
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.receiverId],
      foreignColumns: [invoiceReceiversTable.id],
      name: 'fk_invoices_invoice_receivers'
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.bankAccountId],
      foreignColumns: [invoiceBankingInformationTable.id],
      name: 'fk_invoices_invoice_banking_information'
    }).onDelete('cascade'),
    check(
      'invoices_status_check',
      sql`(status)::text = ANY ((ARRAY['paid'::character varying, 'pending'::character varying, 'canceled'::character varying])::text[])`
    ),
    check(
      'invoices_lifecycle_status_check',
      sql`(lifecycle_status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'voided'::character varying])::text[])`
    ),
    check(
      'invoices_payment_mode_check',
      sql`(payment_mode)::text = ANY ((ARRAY['manual'::character varying, 'disabled'::character varying])::text[])`
    ),
    unique('invoices_user_invoice_id_key').on(table.userId, table.invoiceId),
    unique('invoices_id_user_id_key').on(table.id, table.userId),
    unique('invoices_recipient_signing_token_key').on(
      table.recipientSigningToken
    ),
    unique('invoices_public_invoice_token_key').on(table.publicInvoiceToken),
    index('invoices_paid_income_journal_idx')
      .on(table.userId, table.paidAt)
      .where(sql`status = 'paid'`)
  ]
);

export const invoiceNumberSequencesTable = pgTable(
  'invoice_number_sequences',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    series: varchar({ length: 8 }).notNull(),
    nextNumber: integer('next_number').default(1).notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'fk_invoice_number_sequences_user_id'
    }).onDelete('cascade'),
    unique('invoice_number_sequences_user_series_key').on(
      table.userId,
      table.series
    )
  ]
);

export const invoiceSendersTable = pgTable(
  'invoice_senders',
  {
    id: serial().primaryKey().notNull(),
    invoiceId: integer('invoice_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    type: varchar({ length: 50 }).notNull(),
    businessType: varchar('business_type', { length: 50 }).notNull(),
    businessNumber: varchar('business_number', { length: 255 }).notNull(),
    vatNumber: varchar('vat_number', { length: 255 })
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_senders_invoice_id'
    }).onDelete('cascade')
  ]
);

export const invoiceReceiversTable = pgTable(
  'invoice_receivers',
  {
    id: serial().primaryKey().notNull(),
    invoiceId: integer('invoice_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    type: varchar({ length: 50 }).notNull(),
    businessType: varchar('business_type', { length: 50 }).notNull(),
    businessNumber: varchar('business_number', { length: 255 }).notNull(),
    vatNumber: varchar('vat_number', { length: 255 })
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_receivers_invoice_id'
    }).onDelete('cascade')
  ]
);

export const invoiceBankingInformationTable = pgTable(
  'invoice_banking_information',
  {
    id: serial().primaryKey().notNull(),
    invoiceId: integer('invoice_id').notNull(),
    accountName: varchar({ length: 255 }).notNull(),
    accountNumber: varchar({ length: 100 }).notNull(),
    bankCode: varchar({ length: 100 }).notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoicesTable.id],
      name: 'fk_invoice_banking_information_invoice_id'
    }).onDelete('cascade')
  ]
);

export const clientsTable = pgTable(
  'clients',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 50 }).notNull(),
    businessType: varchar('business_type', { length: 50 }).notNull(),
    businessNumber: varchar('business_number', { length: 255 }).notNull(),
    vatNumber: varchar('vat_number', { length: 255 }),
    address: text().notNull(),
    email: varchar({ length: 255 }).notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    userId: integer('user_id').notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'fk_clients_user_id'
    }).onDelete('cascade')
  ]
);

export const usersTable = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    emailVerifiedAt: timestamp('email_verified_at', {
      withTimezone: true,
      mode: 'string'
    }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    password: varchar({ length: 255 }).notNull(),
    language: varchar({ length: 255 }).notNull(),
    analyticsConsentStatus: varchar('analytics_consent_status', {
      length: 20
    }),
    analyticsConsentUpdatedAt: timestamp('analytics_consent_updated_at', {
      withTimezone: true,
      mode: 'string'
    })
  },
  (table) => [unique('users_email_key').on(table.email)]
);

export const businessProfilesTable = pgTable(
  'business_profiles',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    legalName: varchar('legal_name', { length: 255 }).default('').notNull(),
    activityCertificateNumber: varchar('activity_certificate_number', {
      length: 255
    })
      .default('')
      .notNull(),
    address: text().default('').notNull(),
    invoiceEmail: varchar('invoice_email', { length: 255 }).default('').notNull(),
    phone: varchar({ length: 50 }),
    vatNumber: varchar('vat_number', { length: 255 }),
    signatureUrl: text('signature_url').default('').notNull(),
    logoUrl: text('logo_url').default('').notNull(),
    selectedBankAccountId: integer('selected_bank_account_id'),
    currency: varchar({ length: 3 }).default('eur').notNull(),
    preferredInvoiceLanguage: varchar('preferred_invoice_language', {
      length: 2
    }),
    isVatPayer: boolean('is_vat_payer').default(false).notNull(),
    defaultInvoiceVatMode: varchar('default_invoice_vat_mode', {
      length: 20
    })
      .default('no_vat')
      .notNull(),
    defaultInvoiceSeries: varchar('default_invoice_series', { length: 8 })
      .default('SF')
      .notNull(),
    defaultPaymentTermsDays: integer('default_payment_terms_days')
      .default(30)
      .notNull(),
    onboardingCompletedAt: timestamp('onboarding_completed_at', {
      withTimezone: true,
      mode: 'string'
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] })
      .onDelete('cascade'),
    foreignKey({
      columns: [table.selectedBankAccountId, table.userId],
      foreignColumns: [bankingInformationTable.id, bankingInformationTable.userId]
    }).onDelete('restrict'),
    unique('business_profiles_user_id_key').on(table.userId),
    check('business_profiles_currency_check', sql`${table.currency} = 'eur'`),
    check(
      'business_profiles_vat_mode_check',
      sql`${table.defaultInvoiceVatMode} IN ('no_vat', 'standard_21', 'zero', 'manual')`
    ),
    check(
      'business_profiles_payment_terms_check',
      sql`${table.defaultPaymentTermsDays} IN (7, 14, 30)`
    ),
    check(
      'business_profiles_invoice_series_check',
      sql`${table.defaultInvoiceSeries} ~ '^[A-Z]{2,8}$'`
    )
  ]
);

export const taxProfilesTable = pgTable(
  'tax_profiles',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    taxYear: integer('tax_year').notNull(),
    expenseMethod: varchar('expense_method', { length: 30 }).notNull(),
    isVatRegistered: boolean('is_vat_registered').default(false).notNull(),
    hasEmploymentPsdCoverage: boolean('has_employment_psd_coverage')
      .default(false)
      .notNull(),
    monthlyPsdAmount: numeric('monthly_psd_amount', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    additionalPensionRate: numeric('additional_pension_rate', {
      precision: 5,
      scale: 2
    })
      .default('0')
      .notNull(),
    activityStartDate: date('activity_start_date'),
    activityEndDate: date('activity_end_date'),
    otherDeclaredIncome: numeric('other_declared_income', {
      precision: 12,
      scale: 2
    })
      .default('0')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    unique('tax_profiles_user_year_key').on(table.userId, table.taxYear),
    check('tax_profiles_year_check', sql`${table.taxYear} >= 2020`),
    check('tax_profiles_expense_method_check', sql`${table.expenseMethod} IN ('actual', 'thirty_percent')`),
    check('tax_profiles_monthly_psd_check', sql`${table.monthlyPsdAmount} >= 0`),
    check('tax_profiles_other_income_check', sql`${table.otherDeclaredIncome} >= 0`)
  ]
);

export const bankingInformationTable = pgTable(
  'banking_information',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }),
    code: varchar({ length: 100 }),
    accountNumber: varchar('account_number', { length: 100 }),
    userId: integer('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'banking_information_user_id_fkey'
    }).onDelete('cascade'),
    unique('banking_information_id_user_id_key').on(table.id, table.userId)
  ]
);

export const expensesTable = pgTable(
  'expenses',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    expenseDate: date('expense_date').notNull(),
    paymentDate: date('payment_date'),
    supplier: varchar({ length: 255 }).notNull(),
    documentNumber: varchar('document_number', { length: 255 }),
    description: text().notNull(),
    category: varchar({ length: 100 }).notNull(),
    currency: varchar({ length: 3 }).default('eur').notNull(),
    totalAmount: numeric('total_amount', {
      precision: 10,
      scale: 2
    }).notNull(),
    eurAmount: numeric('eur_amount', {
      precision: 10,
      scale: 2
    }).notNull(),
    vatAmount: numeric('vat_amount', {
      precision: 10,
      scale: 2
    }),
    businessUsePercentage: numeric('business_use_percentage', {
      precision: 5,
      scale: 2
    })
      .default('100')
      .notNull(),
    deductibleAmount: numeric('deductible_amount', {
      precision: 10,
      scale: 2
    }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    notes: text(),
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
      mode: 'string'
    }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'fk_expenses_user_id'
    }).onDelete('cascade'),
    index('expenses_user_date_idx').on(table.userId, table.expenseDate),
    check(
      'expenses_business_use_percentage_check',
      sql`${table.businessUsePercentage} >= 0 AND ${table.businessUsePercentage} <= 100`
    ),
    check('expenses_total_amount_check', sql`${table.totalAmount} >= 0`),
    check('expenses_eur_amount_check', sql`${table.eurAmount} >= 0`),
    check(
      'expenses_deductible_amount_check',
      sql`${table.deductibleAmount} >= 0`
    )
  ]
);

export const expenseAttachmentsTable = pgTable(
  'expense_attachments',
  {
    id: serial().primaryKey().notNull(),
    expenseId: integer('expense_id').notNull(),
    storageProvider: varchar('storage_provider', { length: 50 })
      .default('cloudinary')
      .notNull(),
    storageKey: varchar('storage_key', { length: 255 }).notNull(),
    secureUrl: text('secure_url').notNull(),
    resourceType: varchar('resource_type', { length: 50 })
      .default('auto')
      .notNull(),
    originalFileName: text('original_file_name').notNull(),
    sanitizedFileName: text('sanitized_file_name').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    checksum: varchar({ length: 64 }).notNull(),
    malwareScanStatus: varchar('malware_scan_status', { length: 50 })
      .default('not_configured')
      .notNull(),
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
      mode: 'string'
    }),
    uploadedAt: timestamp('uploaded_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    foreignKey({
      columns: [table.expenseId],
      foreignColumns: [expensesTable.id],
      name: 'fk_expense_attachments_expense_id'
    }).onDelete('cascade'),
    index('expense_attachments_expense_id_idx').on(table.expenseId),
    uniqueIndex('expense_attachments_checksum_expense_key')
      .on(table.expenseId, table.checksum)
      .where(sql`${table.deletedAt} IS NULL`)
  ]
);

export const paymentsTable = pgTable(
  'payments',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    paymentDate: date('payment_date').notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).default('eur').notNull(),
    eurAmount: numeric('eur_amount', { precision: 12, scale: 2 }).notNull(),
    method: varchar({ length: 30 }).default('bank_transfer').notNull(),
    bankReference: text('bank_reference'),
    notes: text(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    index('payments_user_date_idx').on(table.userId, table.paymentDate),
    unique('payments_id_user_id_key').on(table.id, table.userId),
    check('payments_amount_check', sql`${table.amount} > 0`),
    check('payments_eur_amount_check', sql`${table.eurAmount} > 0`),
    check('payments_method_check', sql`${table.method} IN ('bank_transfer', 'cash', 'other')`)
  ]
);

export const paymentAllocationsTable = pgTable(
  'payment_allocations',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    paymentId: integer('payment_id').notNull(),
    invoiceId: integer('invoice_id').notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.paymentId, table.userId], foreignColumns: [paymentsTable.id, paymentsTable.userId] }).onDelete('cascade'),
    foreignKey({ columns: [table.invoiceId, table.userId], foreignColumns: [invoicesTable.id, invoicesTable.userId] }).onDelete('restrict'),
    unique('payment_allocations_payment_invoice_key').on(table.paymentId, table.invoiceId),
    index('payment_allocations_user_invoice_idx').on(table.userId, table.invoiceId),
    check('payment_allocations_amount_check', sql`${table.amount} > 0`)
  ]
);

export const emailDeliveriesTable = pgTable(
  'email_deliveries',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    invoiceId: integer('invoice_id'),
    provider: varchar({ length: 50 }).notNull(),
    providerMessageId: varchar('provider_message_id', { length: 255 }),
    kind: varchar({ length: 50 }).notNull(),
    recipient: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 30 }).default('queued').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),
    failedAt: timestamp('failed_at', { withTimezone: true, mode: 'string' }),
    failureCode: varchar('failure_code', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.invoiceId], foreignColumns: [invoicesTable.id] }).onDelete('set null'),
    uniqueIndex('email_deliveries_provider_message_key').on(table.provider, table.providerMessageId),
    index('email_deliveries_user_created_idx').on(table.userId, table.createdAt),
    check('email_deliveries_status_check', sql`${table.status} IN ('queued', 'sent', 'delivered', 'failed', 'bounced')`)
  ]
);

export const taxEstimatesTable = pgTable(
  'tax_estimates',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    taxProfileId: integer('tax_profile_id').notNull(),
    taxYear: integer('tax_year').notNull(),
    ruleVersion: varchar('rule_version', { length: 50 }).notNull(),
    calculationVersion: integer('calculation_version').notNull(),
    taxableProfit: numeric('taxable_profit', { precision: 12, scale: 2 }).notNull(),
    gpmAmount: numeric('gpm_amount', { precision: 12, scale: 2 }).notNull(),
    vsdAmount: numeric('vsd_amount', { precision: 12, scale: 2 }).notNull(),
    psdAmount: numeric('psd_amount', { precision: 12, scale: 2 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
    assumptions: jsonb().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    foreignKey({ columns: [table.taxProfileId], foreignColumns: [taxProfilesTable.id] }).onDelete('restrict'),
    unique('tax_estimates_user_year_version_key').on(table.userId, table.taxYear, table.calculationVersion),
    index('tax_estimates_user_year_idx').on(table.userId, table.taxYear),
    check('tax_estimates_taxable_profit_check', sql`${table.taxableProfit} >= 0`),
    check('tax_estimates_gpm_check', sql`${table.gpmAmount} >= 0`),
    check('tax_estimates_vsd_check', sql`${table.vsdAmount} >= 0`),
    check('tax_estimates_psd_check', sql`${table.psdAmount} >= 0`),
    check('tax_estimates_total_check', sql`${table.totalAmount} >= 0`)
  ]
);

export const taxPaymentsTable = pgTable(
  'tax_payments',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id').notNull(),
    taxYear: integer('tax_year').notNull(),
    taxType: varchar('tax_type', { length: 20 }).notNull(),
    paymentDate: date('payment_date').notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('cascade'),
    index('tax_payments_user_year_idx').on(table.userId, table.taxYear),
    check('tax_payments_type_check', sql`${table.taxType} IN ('gpm', 'vsd', 'psd')`),
    check('tax_payments_amount_check', sql`${table.amount} > 0`)
  ]
);

export const auditEventsTable = pgTable(
  'audit_events',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id'),
    actorUserId: integer('actor_user_id'),
    action: varchar({ length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: varchar('entity_id', { length: 100 }),
    previousValue: jsonb('previous_value'),
    newValue: jsonb('new_value'),
    requestId: varchar('request_id', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull()
  },
  (table) => [
    foreignKey({ columns: [table.userId], foreignColumns: [usersTable.id] }).onDelete('set null'),
    foreignKey({ columns: [table.actorUserId], foreignColumns: [usersTable.id] }).onDelete('set null'),
    index('audit_events_user_created_idx').on(table.userId, table.createdAt),
    index('audit_events_entity_idx').on(table.entityType, table.entityId)
  ]
);

export const passwordResetTokensTable = pgTable('password_reset_tokens', {
  id: serial().primaryKey().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'string'
  }).notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`)
});

export const emailVerificationTokensTable = pgTable(
  'email_verification_tokens',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    token: varchar({ length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string'
    }).notNull(),
    usedAt: timestamp('used_at', {
      withTimezone: true,
      mode: 'string'
    }),
    lastSentAt: timestamp('last_sent_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'string'
    }).default(sql`CURRENT_TIMESTAMP`)
  }
);

export type InsertInvoice = typeof invoicesTable.$inferInsert;
export type SelectInvoice = typeof invoicesTable.$inferSelect;

export type InsertInvoiceNumberSequence =
  typeof invoiceNumberSequencesTable.$inferInsert;
export type SelectInvoiceNumberSequence =
  typeof invoiceNumberSequencesTable.$inferSelect;

export type InsertBankingInformation =
  typeof bankingInformationTable.$inferInsert;
export type SelectBankingInformation =
  typeof bankingInformationTable.$inferSelect;

export type InsertInvoiceService = typeof invoiceServicesTable.$inferInsert;
export type SelectInvoiceService = typeof invoiceServicesTable.$inferSelect;

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertBusinessProfile = typeof businessProfilesTable.$inferInsert;
export type SelectBusinessProfile = typeof businessProfilesTable.$inferSelect;
export type InsertAuditEvent = typeof auditEventsTable.$inferInsert;

export type InsertClient = typeof clientsTable.$inferInsert;
export type SelectClient = typeof clientsTable.$inferSelect;

export type InsertExpense = typeof expensesTable.$inferInsert;
export type SelectExpense = typeof expensesTable.$inferSelect;

export type InsertExpenseAttachment =
  typeof expenseAttachmentsTable.$inferInsert;
export type SelectExpenseAttachment =
  typeof expenseAttachmentsTable.$inferSelect;
