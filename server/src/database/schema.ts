import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
    paymentProvider: varchar('payment_provider', { length: 50 }),
    paymentCheckoutSessionId: text('payment_checkout_session_id'),
    paymentIntentId: text('payment_intent_id'),
    paymentCompletedAt: timestamp('payment_completed_at', {
      withTimezone: true,
      mode: 'string'
    }),
    paymentFailedAt: timestamp('payment_failed_at', {
      withTimezone: true,
      mode: 'string'
    }),
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
    })
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
    unique('invoices_user_invoice_id_key').on(table.userId, table.invoiceId),
    unique('invoices_recipient_signing_token_key').on(
      table.recipientSigningToken
    ),
    unique('invoices_public_invoice_token_key').on(table.publicInvoiceToken),
    unique('invoices_payment_checkout_session_id_key').on(
      table.paymentCheckoutSessionId
    ),
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
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 50 }).notNull(),
    businessType: varchar('business_type', { length: 50 }).notNull(),
    businessNumber: varchar('business_number', { length: 255 }).notNull(),
    vatNumber: varchar('vat_number', { length: 255 }),
    address: text().notNull(),
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
    signature: varchar({ length: 255 }).notNull(),
    selectedBankAccountId: integer('selected_bank_account_id'),
    profilePictureUrl: varchar('profile_picture_url', {
      length: 255
    }).notNull(),
    currency: varchar({ length: 255 }).notNull(),
    language: varchar({ length: 255 }).notNull(),
    preferredInvoiceLanguage: varchar('preferred_invoice_language', {
      length: 255
    }),
    subscriptionStatus: varchar('subscription_status', { length: 50 }),
    onboardingCompletedAt: timestamp('onboarding_completed_at', {
      withTimezone: true,
      mode: 'string'
    }),
    trialStartedAt: timestamp('trial_started_at', {
      withTimezone: true,
      mode: 'string'
    }),
    trialEndsAt: timestamp('trial_ends_at', {
      withTimezone: true,
      mode: 'string'
    }),
    subscriptionGraceEndsAt: timestamp('subscription_grace_ends_at', {
      withTimezone: true,
      mode: 'string'
    }),
    subscriptionCurrentPeriodEndsAt: timestamp(
      'subscription_current_period_ends_at',
      {
        withTimezone: true,
        mode: 'string'
      }
    ),
    subscriptionCancelAt: timestamp('subscription_cancel_at', {
      withTimezone: true,
      mode: 'string'
    }),
    paymentSuccessPending: boolean('payment_success_pending')
      .default(false)
      .notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.selectedBankAccountId],
      foreignColumns: [bankingInformationTable.id],
      name: 'fk_selected_bank_account'
    }).onDelete('cascade'),
    unique('users_email_key').on(table.email)
  ]
);

export const bankingInformationTable = pgTable(
  'banking_information',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }),
    code: varchar({ length: 100 }),
    accountNumber: varchar('account_number', { length: 100 }),
    userId: integer('user_id')
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: 'banking_information_user_id_fkey'
    }).onDelete('cascade')
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

export const stripeAccountsTable = pgTable('stripe_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique()
});

export const stripeMerchantAccountsTable = pgTable('stripe_merchant_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  stripeConnectedAccountId: text('stripe_connected_account_id')
    .notNull()
    .unique(),
  chargesEnabled: boolean('charges_enabled').default(false).notNull(),
  payoutsEnabled: boolean('payouts_enabled').default(false).notNull(),
  detailsSubmitted: boolean('details_submitted').default(false).notNull(),
  onboardingCompletedAt: timestamp('onboarding_completed_at', {
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
});

export const stripeWebhookEventsTable = pgTable('stripe_webhook_events', {
  id: serial('id').primaryKey(),
  stripeEventId: text('stripe_event_id').notNull().unique(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', {
    withTimezone: true,
    mode: 'string'
  }).default(sql`CURRENT_TIMESTAMP`)
});

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

export type InsertClient = typeof clientsTable.$inferInsert;
export type SelectClient = typeof clientsTable.$inferSelect;
