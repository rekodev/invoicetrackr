import {
  and,
  asc,
  type Column,
  eq,
  getTableColumns,
  isNull,
  like,
  ne,
  or
} from 'drizzle-orm';

import { parseCloudinaryUrl } from '../utils/storage';
import { db } from './db';
import {
  bankingInformationTable,
  businessProfilesTable,
  clientsTable,
  cryptoWalletsTable,
  emailDeliveriesTable,
  expenseAttachmentsTable,
  expensesTable,
  invoiceBankingInformationTable,
  invoiceCryptoWalletsTable,
  invoiceReceiversTable,
  invoiceSendersTable,
  invoiceServicesTable,
  invoicesTable,
  paymentAllocationsTable,
  paymentsTable,
  taxEstimatesTable,
  taxPaymentsTable,
  taxProfilesTable,
  usersTable
} from './schema';

const without = <
  Columns extends Record<string, unknown>,
  Excluded extends keyof Columns
>(
  columns: Columns,
  excluded: Excluded[]
) =>
  Object.fromEntries(
    Object.entries(columns).filter(
      ([key]) => !excluded.includes(key as Excluded)
    )
  ) as Omit<Columns, Excluded>;

const invoiceColumns = without(getTableColumns(invoicesTable), [
  'recipientSigningToken',
  'publicInvoiceToken',
  'recipientDetailsToken'
]);

const attachmentColumns = without(getTableColumns(expenseAttachmentsTable), [
  'storageProvider',
  'storageKey',
  'secureUrl'
]);

const emailDeliveryColumns = without(getTableColumns(emailDeliveriesTable), [
  'provider',
  'providerMessageId',
  'providerPayload',
  'providerStartedAt',
  'attemptKey',
  'recoveryExpiresAt',
  'leaseToken',
  'leaseUntil'
]);

const ownInvoice = (userId: number) => eq(invoicesTable.userId, userId);

export const getAccountExportFromDb = async (userId: number) => {
  const [
    [user],
    [businessProfile],
    bankAccounts,
    cryptoWallets,
    clients,
    invoices,
    invoiceServices,
    invoiceSenders,
    invoiceReceivers,
    invoiceBankAccounts,
    invoiceCryptoWallets,
    payments,
    paymentAllocations,
    emailDeliveries,
    expenses,
    expenseAttachments,
    taxProfiles,
    taxEstimates,
    taxPayments
  ] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        emailVerifiedAt: usersTable.emailVerifiedAt,
        language: usersTable.language,
        analyticsConsentStatus: usersTable.analyticsConsentStatus,
        createdAt: usersTable.createdAt
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId)),
    db
      .select(
        without(getTableColumns(businessProfilesTable), ['logoStorageKey'])
      )
      .from(businessProfilesTable)
      .where(eq(businessProfilesTable.userId, userId)),
    db
      .select()
      .from(bankingInformationTable)
      .where(eq(bankingInformationTable.userId, userId))
      .orderBy(asc(bankingInformationTable.id)),
    db
      .select()
      .from(cryptoWalletsTable)
      .where(eq(cryptoWalletsTable.userId, userId))
      .orderBy(asc(cryptoWalletsTable.id)),
    db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.userId, userId))
      .orderBy(asc(clientsTable.id)),
    db
      .select(invoiceColumns)
      .from(invoicesTable)
      .where(ownInvoice(userId))
      .orderBy(asc(invoicesTable.date), asc(invoicesTable.id)),
    db
      .select(getTableColumns(invoiceServicesTable))
      .from(invoiceServicesTable)
      .innerJoin(
        invoicesTable,
        eq(invoicesTable.id, invoiceServicesTable.invoiceId)
      )
      .where(ownInvoice(userId))
      .orderBy(asc(invoiceServicesTable.id)),
    db
      .select(getTableColumns(invoiceSendersTable))
      .from(invoiceSendersTable)
      .innerJoin(invoicesTable, eq(invoicesTable.id, invoiceSendersTable.invoiceId))
      .where(ownInvoice(userId))
      .orderBy(asc(invoiceSendersTable.id)),
    db
      .select(getTableColumns(invoiceReceiversTable))
      .from(invoiceReceiversTable)
      .innerJoin(
        invoicesTable,
        eq(invoicesTable.id, invoiceReceiversTable.invoiceId)
      )
      .where(ownInvoice(userId))
      .orderBy(asc(invoiceReceiversTable.id)),
    db
      .select(getTableColumns(invoiceBankingInformationTable))
      .from(invoiceBankingInformationTable)
      .innerJoin(
        invoicesTable,
        eq(invoicesTable.id, invoiceBankingInformationTable.invoiceId)
      )
      .where(ownInvoice(userId))
      .orderBy(asc(invoiceBankingInformationTable.id)),
    db
      .select(getTableColumns(invoiceCryptoWalletsTable))
      .from(invoiceCryptoWalletsTable)
      .innerJoin(
        invoicesTable,
        eq(invoicesTable.id, invoiceCryptoWalletsTable.invoiceId)
      )
      .where(ownInvoice(userId))
      .orderBy(asc(invoiceCryptoWalletsTable.id)),
    db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.userId, userId))
      .orderBy(asc(paymentsTable.id)),
    db
      .select()
      .from(paymentAllocationsTable)
      .where(eq(paymentAllocationsTable.userId, userId))
      .orderBy(asc(paymentAllocationsTable.id)),
    db
      .select(emailDeliveryColumns)
      .from(emailDeliveriesTable)
      .where(eq(emailDeliveriesTable.userId, userId))
      .orderBy(asc(emailDeliveriesTable.id)),
    db
      .select()
      .from(expensesTable)
      .where(
        and(eq(expensesTable.userId, userId), isNull(expensesTable.deletedAt))
      )
      .orderBy(asc(expensesTable.expenseDate), asc(expensesTable.id)),
    db
      .select(attachmentColumns)
      .from(expenseAttachmentsTable)
      .innerJoin(
        expensesTable,
        eq(expensesTable.id, expenseAttachmentsTable.expenseId)
      )
      .where(
        and(
          eq(expensesTable.userId, userId),
          isNull(expensesTable.deletedAt),
          isNull(expenseAttachmentsTable.deletedAt)
        )
      )
      .orderBy(asc(expenseAttachmentsTable.id)),
    db
      .select()
      .from(taxProfilesTable)
      .where(eq(taxProfilesTable.userId, userId))
      .orderBy(asc(taxProfilesTable.taxYear)),
    db
      .select()
      .from(taxEstimatesTable)
      .where(eq(taxEstimatesTable.userId, userId))
      .orderBy(asc(taxEstimatesTable.id)),
    db
      .select()
      .from(taxPaymentsTable)
      .where(eq(taxPaymentsTable.userId, userId))
      .orderBy(asc(taxPaymentsTable.id))
  ]);

  return {
    user,
    businessProfile: businessProfile ?? null,
    bankAccounts,
    cryptoWallets,
    clients,
    invoices,
    invoiceServices,
    invoiceSenders,
    invoiceReceivers,
    invoiceBankAccounts,
    invoiceCryptoWallets,
    payments,
    paymentAllocations,
    emailDeliveries,
    expenses,
    expenseAttachments,
    taxProfiles,
    taxEstimates,
    taxPayments
  };
};

export const getAccountFilesFromDb = async (userId: number) => {
  const [attachments, [profile], signatures] = await Promise.all([
    db
      .select({
        id: expenseAttachmentsTable.id,
        expenseId: expenseAttachmentsTable.expenseId,
        storageKey: expenseAttachmentsTable.storageKey,
        resourceType: expenseAttachmentsTable.resourceType,
        mimeType: expenseAttachmentsTable.mimeType,
        sanitizedFileName: expenseAttachmentsTable.sanitizedFileName,
        deletedAt: expenseAttachmentsTable.deletedAt,
        expenseDeletedAt: expensesTable.deletedAt
      })
      .from(expenseAttachmentsTable)
      .innerJoin(
        expensesTable,
        eq(expensesTable.id, expenseAttachmentsTable.expenseId)
      )
      .where(eq(expensesTable.userId, userId)),
    db
      .select({
        logoUrl: businessProfilesTable.logoUrl,
        signatureUrl: businessProfilesTable.signatureUrl
      })
      .from(businessProfilesTable)
      .where(eq(businessProfilesTable.userId, userId)),
    db
      .select({
        senderSignature: invoicesTable.senderSignature,
        receiverSignature: invoicesTable.receiverSignature
      })
      .from(invoicesTable)
      .where(ownInvoice(userId))
  ]);

  return { attachments, profile: profile ?? null, signatures };
};

export const getSharedSignaturePublicIdsFromDb = async (
  userId: number,
  publicIds: string[]
) => {
  if (!publicIds.length) return new Set<string>();

  const patterns = publicIds.map((publicId) => `%/${publicId}%`);
  const matchesAny = (column: Column) =>
    or(...patterns.map((pattern) => like(column, pattern)));

  const [profiles, invoices] = await Promise.all([
    db
      .select({ url: businessProfilesTable.signatureUrl })
      .from(businessProfilesTable)
      .where(
        and(
          ne(businessProfilesTable.userId, userId),
          matchesAny(businessProfilesTable.signatureUrl)
        )
      ),
    db
      .select({
        senderSignature: invoicesTable.senderSignature,
        receiverSignature: invoicesTable.receiverSignature
      })
      .from(invoicesTable)
      .where(
        and(
          ne(invoicesTable.userId, userId),
          or(
            matchesAny(invoicesTable.senderSignature),
            matchesAny(invoicesTable.receiverSignature)
          )
        )
      )
  ]);

  const usedPublicIds = new Set(
    [
      ...profiles.map(({ url }) => url),
      ...invoices.flatMap(({ senderSignature, receiverSignature }) => [
        senderSignature,
        receiverSignature
      ])
    ].map((url) => parseCloudinaryUrl(url)?.asset.publicId)
  );

  return new Set(publicIds.filter((publicId) => usedPublicIds.has(publicId)));
};

export type AccountExportData = Awaited<
  ReturnType<typeof getAccountExportFromDb>
>;
export type AccountFiles = Awaited<ReturnType<typeof getAccountFilesFromDb>>;
