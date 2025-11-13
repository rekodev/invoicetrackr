import {
  check,
  date,
  foreignKey,
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
    amount: numeric({ precision: 10, scale: 2 }).notNull()
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
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar({ length: 50 }).notNull(),
    dueDate: date('due_date').notNull(),
    invoiceId: varchar('invoice_id').notNull(),
    id: serial().primaryKey().notNull(),
    senderSignature: varchar('sender_signature', { length: 255 }).notNull(),
    bankAccountId: integer('bank_account_id')
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
    businessNumber: varchar('business_number', { length: 255 }).notNull()
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
    businessNumber: varchar('business_number', { length: 255 }).notNull()
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
    password: varchar({ length: 255 }).notNull(),
    signature: varchar({ length: 255 }).notNull(),
    selectedBankAccountId: integer('selected_bank_account_id'),
    profilePictureUrl: varchar('profile_picture_url', {
      length: 255
    }).notNull(),
    currency: varchar({ length: 255 }).notNull(),
    language: varchar({ length: 255 }).notNull()
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

export const stripeAccountsTable = pgTable('stripe_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique()
});

export type InsertInvoice = typeof invoicesTable.$inferInsert;
export type SelectInvoice = typeof invoicesTable.$inferSelect;

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
