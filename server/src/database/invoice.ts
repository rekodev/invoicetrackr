import type { InvoiceBody, PublicInvoiceSigning } from '@invoicetrackr/types';
import { and, desc, eq, gt, gte, inArray, isNull, or, sql } from 'drizzle-orm';

import {
  bankingInformationTable,
  invoiceBankingInformationTable,
  invoiceNumberSequencesTable,
  invoiceReceiversTable,
  invoiceSendersTable,
  invoiceServicesTable,
  invoicesTable,
  usersTable
} from './schema';
import { calculateInvoiceTotals } from '../utils/invoice';
import { db } from './db';
import { jsonAgg } from '../utils/json';

const DEFAULT_INVOICE_SERIES = 'SF';
const INVOICE_NUMBER_PADDING = 3;

export type InvoiceFromDb = Omit<
  InvoiceBody,
  'sender' | 'receiver' | 'services' | 'bankingInformation'
> & {
  bankingInformation: Omit<
    typeof bankingInformationTable.$inferSelect,
    'userId'
  > | null;
  sender: Omit<typeof invoiceSendersTable.$inferSelect, 'invoiceId'> | null;
  receiver: Omit<typeof invoiceReceiversTable.$inferSelect, 'invoiceId'> | null;
  services: Array<
    Omit<typeof invoiceServicesTable.$inferSelect, 'invoiceId'>
  > | null;
};

const normalizeInvoiceSeries = (series?: string | null) =>
  (series || DEFAULT_INVOICE_SERIES).trim().toUpperCase();

const formatInvoiceNumber = (series: string, number: number) =>
  `${series}${String(number).padStart(INVOICE_NUMBER_PADDING, '0')}`;

const parseInvoiceNumber = (invoiceId: string) => {
  const match = invoiceId
    .trim()
    .toUpperCase()
    .match(/^([A-Z]{2,8})(\d{1,9})$/);

  if (!match) return null;

  return {
    series: match[1],
    number: Number(match[2])
  };
};

type InvoiceTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const getInvoiceSeriesForNextNumber = async (
  query: InvoiceTransaction | typeof db,
  userId: number,
  requestedSeries?: string
) => {
  if (requestedSeries) return normalizeInvoiceSeries(requestedSeries);

  const latestInvoices = await query
    .select({ invoiceId: invoicesTable.invoiceId })
    .from(invoicesTable)
    .where(eq(invoicesTable.userId, userId))
    .orderBy(desc(invoicesTable.id))
    .limit(1);
  const latestInvoiceSeries = latestInvoices.at(0)?.invoiceId
    ? parseInvoiceNumber(latestInvoices[0].invoiceId)?.series
    : null;

  return latestInvoiceSeries || DEFAULT_INVOICE_SERIES;
};

export const getNextInvoiceNumberFromDb = async (
  userId: number,
  requestedSeries?: string
) => {
  const series = await getInvoiceSeriesForNextNumber(
    db,
    userId,
    requestedSeries
  );
  const sequences = await db
    .select({
      nextNumber: invoiceNumberSequencesTable.nextNumber
    })
    .from(invoiceNumberSequencesTable)
    .where(
      and(
        eq(invoiceNumberSequencesTable.userId, userId),
        eq(invoiceNumberSequencesTable.series, series)
      )
    );
  const nextNumber = sequences.at(0)?.nextNumber || 1;

  return {
    invoiceId: formatInvoiceNumber(series, nextNumber),
    series,
    nextNumber
  };
};

const reserveNextInvoiceNumber = async (
  tx: InvoiceTransaction,
  userId: number,
  requestedSeries?: string
) => {
  const series = await getInvoiceSeriesForNextNumber(
    tx,
    userId,
    requestedSeries
  );
  const sequence = await tx
    .insert(invoiceNumberSequencesTable)
    .values({
      userId,
      series,
      nextNumber: 2
    })
    .onConflictDoUpdate({
      target: [
        invoiceNumberSequencesTable.userId,
        invoiceNumberSequencesTable.series
      ],
      set: {
        nextNumber: sql`${invoiceNumberSequencesTable.nextNumber} + 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      }
    })
    .returning({ nextNumber: invoiceNumberSequencesTable.nextNumber });

  const reservedNumber = Number(sequence.at(0)?.nextNumber || 2) - 1;

  return formatInvoiceNumber(series, reservedNumber);
};

const advanceInvoiceNumberSequence = async (
  tx: InvoiceTransaction,
  userId: number,
  invoiceId: string
) => {
  const parsedInvoiceNumber = parseInvoiceNumber(invoiceId);

  if (!parsedInvoiceNumber) return;

  const nextNumber = parsedInvoiceNumber.number + 1;

  await tx
    .insert(invoiceNumberSequencesTable)
    .values({
      userId,
      series: parsedInvoiceNumber.series,
      nextNumber
    })
    .onConflictDoUpdate({
      target: [
        invoiceNumberSequencesTable.userId,
        invoiceNumberSequencesTable.series
      ],
      set: {
        nextNumber: sql`GREATEST(${invoiceNumberSequencesTable.nextNumber}, ${nextNumber})`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      }
    });
};

export const findInvoiceById = async (userId: number, id: number) => {
  const invoices = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));

  return invoices.at(0);
};

export const findInvoiceByInvoiceId = async (
  userId: number,
  invoiceId: string
) => {
  const invoices = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.invoiceId, invoiceId),
        eq(invoicesTable.userId, userId)
      )
    );

  return invoices.at(0);
};

export const getInvoicesFromDb = async (
  userId: number
): Promise<Array<InvoiceFromDb>> => {
  const invoices = await db
    .select({
      id: invoicesTable.id,
      invoiceId: invoicesTable.invoiceId,
      date: invoicesTable.date,
      subtotalAmount: invoicesTable.subtotalAmount,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status,
      lifecycleStatus: invoicesTable.lifecycleStatus,
      dueDate: invoicesTable.dueDate,
      senderSignature: invoicesTable.senderSignature,
      receiverSignature: invoicesTable.receiverSignature,
      issuedAt: invoicesTable.issuedAt,
      paidAt: invoicesTable.paidAt,
      voidedAt: invoicesTable.voidedAt,
      recipientSigningToken: invoicesTable.recipientSigningToken,
      recipientSigningSentAt: invoicesTable.recipientSigningSentAt,
      recipientSigningEmail: invoicesTable.recipientSigningEmail,
      recipientSigningCreatedAt: invoicesTable.recipientSigningCreatedAt,
      recipientSigningExpiresAt: invoicesTable.recipientSigningExpiresAt,
      recipientSigningRevokedAt: invoicesTable.recipientSigningRevokedAt,
      recipientSignedAt: invoicesTable.recipientSignedAt,
      bankingInformation: {
        id: invoiceBankingInformationTable.id,
        code: invoiceBankingInformationTable.bankCode,
        name: invoiceBankingInformationTable.accountName,
        accountNumber: invoiceBankingInformationTable.accountNumber
      },
      sender: {
        id: invoiceSendersTable.id,
        name: invoiceSendersTable.name,
        type: invoiceSendersTable.type,
        businessType: invoiceSendersTable.businessType,
        businessNumber: invoiceSendersTable.businessNumber,
        vatNumber: invoiceSendersTable.vatNumber,
        address: invoiceSendersTable.address,
        email: invoiceSendersTable.email
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
        vatNumber: invoiceReceiversTable.vatNumber,
        address: invoiceReceiversTable.address,
        email: invoiceReceiversTable.email
      },
      services: jsonAgg({
        id: invoiceServicesTable.id,
        description: invoiceServicesTable.description,
        amount: invoiceServicesTable.amount,
        quantity: invoiceServicesTable.quantity,
        unit: invoiceServicesTable.unit,
        vatRate: invoiceServicesTable.vatRate
      })
    })
    .from(invoicesTable)
    .leftJoin(
      invoiceSendersTable,
      eq(invoicesTable.senderId, invoiceSendersTable.id)
    )
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .leftJoin(
      invoiceBankingInformationTable,
      eq(invoicesTable.bankAccountId, invoiceBankingInformationTable.id)
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id)
    )
    .where(eq(invoicesTable.userId, userId))
    .groupBy(
      invoicesTable.id,
      invoiceSendersTable.id,
      invoiceReceiversTable.id,
      invoiceBankingInformationTable.id
    )
    .orderBy(desc(invoicesTable.id));

  return invoices;
};

export const getInvoiceFromDb = async (
  userId: number,
  id: number,
  transaction?: InvoiceTransaction
): Promise<InvoiceFromDb | undefined> => {
  const invoices = await (transaction ? transaction : db)
    .select({
      id: invoicesTable.id,
      invoiceId: invoicesTable.invoiceId,
      date: invoicesTable.date,
      subtotalAmount: invoicesTable.subtotalAmount,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status,
      lifecycleStatus: invoicesTable.lifecycleStatus,
      dueDate: invoicesTable.dueDate,
      senderSignature: invoicesTable.senderSignature,
      receiverSignature: invoicesTable.receiverSignature,
      issuedAt: invoicesTable.issuedAt,
      paidAt: invoicesTable.paidAt,
      voidedAt: invoicesTable.voidedAt,
      recipientSigningToken: invoicesTable.recipientSigningToken,
      recipientSigningSentAt: invoicesTable.recipientSigningSentAt,
      recipientSigningEmail: invoicesTable.recipientSigningEmail,
      recipientSigningCreatedAt: invoicesTable.recipientSigningCreatedAt,
      recipientSigningExpiresAt: invoicesTable.recipientSigningExpiresAt,
      recipientSigningRevokedAt: invoicesTable.recipientSigningRevokedAt,
      recipientSignedAt: invoicesTable.recipientSignedAt,
      bankingInformation: {
        id: invoiceBankingInformationTable.id,
        code: invoiceBankingInformationTable.bankCode,
        name: invoiceBankingInformationTable.accountName,
        accountNumber: invoiceBankingInformationTable.accountNumber
      },
      sender: {
        id: invoiceSendersTable.id,
        name: invoiceSendersTable.name,
        type: invoiceSendersTable.type,
        businessType: invoiceSendersTable.businessType,
        businessNumber: invoiceSendersTable.businessNumber,
        vatNumber: invoiceSendersTable.vatNumber,
        address: invoiceSendersTable.address,
        email: invoiceSendersTable.email
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
        vatNumber: invoiceReceiversTable.vatNumber,
        address: invoiceReceiversTable.address,
        email: invoiceReceiversTable.email
      },
      services: jsonAgg({
        id: invoiceServicesTable.id,
        description: invoiceServicesTable.description,
        amount: invoiceServicesTable.amount,
        quantity: invoiceServicesTable.quantity,
        unit: invoiceServicesTable.unit,
        vatRate: invoiceServicesTable.vatRate
      })
    })
    .from(invoicesTable)
    .leftJoin(
      invoiceSendersTable,
      eq(invoicesTable.senderId, invoiceSendersTable.id)
    )
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .leftJoin(
      invoiceBankingInformationTable,
      eq(invoicesTable.bankAccountId, invoiceBankingInformationTable.id)
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id)
    )
    .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.id, id)))
    .groupBy(
      invoicesTable.id,
      invoiceSendersTable.id,
      invoiceReceiversTable.id,
      invoiceBankingInformationTable.id
    );

  return invoices.at(0);
};

export const insertInvoiceInDb = async (
  invoiceData: InvoiceBody,
  userId: number,
  senderSignature: string
): Promise<InvoiceFromDb | null> => {
  const invoice = await db.transaction(async (tx) => {
    const totals = calculateInvoiceTotals(invoiceData.services);
    const invoiceId =
      invoiceData.invoiceSeries || !invoiceData.invoiceId
        ? await reserveNextInvoiceNumber(tx, userId, invoiceData.invoiceSeries)
        : invoiceData.invoiceId;

    // Invoice insert
    const invoices = await tx
      .insert(invoicesTable)
      .values({
        userId,
        date: invoiceData.date,
        invoiceId,
        subtotalAmount: totals.subtotalAmount,
        vatAmount: totals.vatAmount,
        totalAmount: totals.totalAmount,
        status: invoiceData.status,
        lifecycleStatus: invoiceData.lifecycleStatus || 'draft',
        dueDate: invoiceData.dueDate,
        senderSignature: senderSignature,
        receiverSignature: invoiceData.receiverSignature || null
      })
      .returning({ id: invoicesTable.id });

    const insertedInvoiceId = invoices.at(0)?.id;

    if (!insertedInvoiceId) throw new Error('Failed to insert invoice');

    if (!invoiceData.invoiceSeries && invoiceData.invoiceId) {
      await advanceInvoiceNumberSequence(tx, userId, invoiceData.invoiceId);
    }

    // Invoice sender insert
    const senders = await tx
      .insert(invoiceSendersTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.sender.name,
        email: invoiceData.sender.email || '',
        address: invoiceData.sender.address,
        type: invoiceData.sender.type,
        businessType: invoiceData.sender.businessType,
        businessNumber: invoiceData.sender.businessNumber,
        vatNumber: invoiceData.sender.vatNumber || null
      })
      .returning({ id: invoiceSendersTable.id });

    // Invoice receiver insert
    const receivers = await tx
      .insert(invoiceReceiversTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.receiver.name,
        email: invoiceData.receiver.email || '',
        address: invoiceData.receiver.address,
        type: invoiceData.receiver.type,
        businessType: invoiceData.receiver.businessType,
        businessNumber: invoiceData.receiver.businessNumber,
        vatNumber: invoiceData.receiver.vatNumber || null
      })
      .returning({ id: invoiceReceiversTable.id });

    // Invoice banking information insert
    const bankAccounts = await tx
      .insert(invoiceBankingInformationTable)
      .values({
        invoiceId: insertedInvoiceId,
        accountName: invoiceData.bankingInformation.name,
        accountNumber: invoiceData.bankingInformation.accountNumber,
        bankCode: invoiceData.bankingInformation.code
      })
      .returning({ id: invoiceBankingInformationTable.id });

    // Invoice services insert
    for (const service of invoiceData.services) {
      await tx.insert(invoiceServicesTable).values({
        quantity: service.quantity,
        amount: String(service.amount),
        vatRate: String(service.vatRate || 0),
        unit: service.unit,
        description: service.description,
        invoiceId: insertedInvoiceId
      });
    }

    await tx
      .update(invoicesTable)
      .set({
        senderId: senders.at(0)?.id,
        receiverId: receivers.at(0)?.id,
        bankAccountId: bankAccounts.at(0)?.id
      })
      .where(eq(invoicesTable.id, Number(insertedInvoiceId)));

    const insertedInvoice = await getInvoiceFromDb(
      userId,
      Number(insertedInvoiceId),
      tx
    );

    return !!insertedInvoice?.services?.length ? insertedInvoice : null;
  });

  return invoice;
};

export const updateInvoiceInDb = async (
  userId: number,
  id: number,
  invoiceData: InvoiceBody,
  senderSignature: string
): Promise<InvoiceFromDb | null | undefined> => {
  const updatedInvoice = await db.transaction(async (tx) => {
    const totals = calculateInvoiceTotals(invoiceData.services);

    // Get the current invoice to access senderId, receiverId, and bankAccountId
    const currentInvoice = await tx
      .select({
        senderId: invoicesTable.senderId,
        receiverId: invoicesTable.receiverId,
        bankAccountId: invoicesTable.bankAccountId,
        lifecycleStatus: invoicesTable.lifecycleStatus,
        issuedAt: invoicesTable.issuedAt,
        paidAt: invoicesTable.paidAt,
        voidedAt: invoicesTable.voidedAt,
        receiverSignature: invoicesTable.receiverSignature,
        recipientSigningToken: invoicesTable.recipientSigningToken,
        recipientSigningSentAt: invoicesTable.recipientSigningSentAt,
        recipientSigningEmail: invoicesTable.recipientSigningEmail,
        recipientSigningCreatedAt: invoicesTable.recipientSigningCreatedAt,
        recipientSigningExpiresAt: invoicesTable.recipientSigningExpiresAt,
        recipientSigningRevokedAt: invoicesTable.recipientSigningRevokedAt,
        recipientSignedAt: invoicesTable.recipientSignedAt
      })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.id, id)));

    if (!currentInvoice[0]) return null;

    const currentInvoiceData = currentInvoice[0];

    // Update the existing sender record
    if (currentInvoiceData.senderId) {
      await tx
        .update(invoiceSendersTable)
        .set({
          name: invoiceData.sender.name,
          email: invoiceData.sender.email || '',
          address: invoiceData.sender.address,
          type: invoiceData.sender.type,
          businessType: invoiceData.sender.businessType,
          businessNumber: invoiceData.sender.businessNumber,
          vatNumber: invoiceData.sender.vatNumber || null
        })
        .where(eq(invoiceSendersTable.id, currentInvoiceData.senderId));
    } else {
      // If no senderId exists, create a new sender record
      const insertedSender = await tx
        .insert(invoiceSendersTable)
        .values({
          invoiceId: id,
          name: invoiceData.sender.name,
          email: invoiceData.sender.email || '',
          address: invoiceData.sender.address,
          type: invoiceData.sender.type,
          businessType: invoiceData.sender.businessType,
          businessNumber: invoiceData.sender.businessNumber,
          vatNumber: invoiceData.sender.vatNumber || null
        })
        .returning({ id: invoiceSendersTable.id });

      currentInvoiceData.senderId = insertedSender[0].id;
    }

    // Update the existing receiver record
    if (currentInvoiceData.receiverId) {
      await tx
        .update(invoiceReceiversTable)
        .set({
          name: invoiceData.receiver.name,
          email: invoiceData.receiver.email || '',
          address: invoiceData.receiver.address,
          type: invoiceData.receiver.type,
          businessType: invoiceData.receiver.businessType,
          businessNumber: invoiceData.receiver.businessNumber,
          vatNumber: invoiceData.receiver.vatNumber || null
        })
        .where(eq(invoiceReceiversTable.id, currentInvoiceData.receiverId));
    } else {
      // If no receiverId exists, create a new receiver record
      const insertedReceiver = await tx
        .insert(invoiceReceiversTable)
        .values({
          invoiceId: id,
          name: invoiceData.receiver.name,
          email: invoiceData.receiver.email || '',
          address: invoiceData.receiver.address,
          type: invoiceData.receiver.type,
          businessType: invoiceData.receiver.businessType,
          businessNumber: invoiceData.receiver.businessNumber,
          vatNumber: invoiceData.receiver.vatNumber || null
        })
        .returning({ id: invoiceReceiversTable.id });

      currentInvoiceData.receiverId = insertedReceiver[0].id;
    }

    // Update the existing banking information record
    if (currentInvoiceData.bankAccountId) {
      await tx
        .update(invoiceBankingInformationTable)
        .set({
          accountName: invoiceData.bankingInformation.name,
          accountNumber: invoiceData.bankingInformation.accountNumber,
          bankCode: invoiceData.bankingInformation.code
        })
        .where(
          eq(
            invoiceBankingInformationTable.id,
            currentInvoiceData.bankAccountId
          )
        );
    } else {
      // If no bankAccountId exists, create a new banking information record
      const insertedBankInfo = await tx
        .insert(invoiceBankingInformationTable)
        .values({
          invoiceId: id,
          accountName: invoiceData.bankingInformation.name,
          accountNumber: invoiceData.bankingInformation.accountNumber,
          bankCode: invoiceData.bankingInformation.code
        })
        .returning({ id: invoiceBankingInformationTable.id });

      currentInvoiceData.bankAccountId = insertedBankInfo[0].id;
    }

    // Update the main invoice record
    const invoices = await tx
      .update(invoicesTable)
      .set({
        userId,
        invoiceId: invoiceData.invoiceId,
        senderId: currentInvoiceData.senderId,
        receiverId: currentInvoiceData.receiverId,
        bankAccountId: currentInvoiceData.bankAccountId,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        lifecycleStatus:
          invoiceData.lifecycleStatus || currentInvoiceData.lifecycleStatus,
        subtotalAmount: totals.subtotalAmount,
        vatAmount: totals.vatAmount,
        totalAmount: totals.totalAmount,
        issuedAt: invoiceData.issuedAt ?? currentInvoiceData.issuedAt,
        paidAt: invoiceData.paidAt ?? currentInvoiceData.paidAt,
        voidedAt: invoiceData.voidedAt ?? currentInvoiceData.voidedAt,
        senderSignature,
        receiverSignature:
          invoiceData.receiverSignature ?? currentInvoiceData.receiverSignature,
        recipientSigningToken:
          invoiceData.recipientSigningToken ??
          currentInvoiceData.recipientSigningToken,
        recipientSigningSentAt:
          invoiceData.recipientSigningSentAt ??
          currentInvoiceData.recipientSigningSentAt,
        recipientSigningEmail:
          invoiceData.recipientSigningEmail ??
          currentInvoiceData.recipientSigningEmail,
        recipientSigningCreatedAt:
          invoiceData.recipientSigningCreatedAt ??
          currentInvoiceData.recipientSigningCreatedAt,
        recipientSigningExpiresAt:
          invoiceData.recipientSigningExpiresAt ??
          currentInvoiceData.recipientSigningExpiresAt,
        recipientSigningRevokedAt:
          invoiceData.recipientSigningRevokedAt ??
          currentInvoiceData.recipientSigningRevokedAt,
        recipientSignedAt:
          invoiceData.recipientSignedAt ?? currentInvoiceData.recipientSignedAt
      })
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.id, id)))
      .returning({ id: invoicesTable.id });

    if (!invoices[0]) return null;

    if (invoiceData.invoiceId) {
      await advanceInvoiceNumberSequence(tx, userId, invoiceData.invoiceId);
    }

    // Handle services update
    const existingServices = await tx
      .select({ id: invoiceServicesTable.id })
      .from(invoiceServicesTable)
      .where(eq(invoiceServicesTable.invoiceId, id));

    const existingServiceIds = existingServices.map((service) => service.id);
    const newServiceIds = invoiceData.services.map(
      (service) => service.id || 0
    );

    const servicesToDelete = existingServiceIds.filter(
      (serviceId) => !newServiceIds.includes(serviceId)
    );

    if (servicesToDelete.length > 0) {
      await tx
        .delete(invoiceServicesTable)
        .where(inArray(invoiceServicesTable.id, servicesToDelete));
    }

    for (const service of invoiceData.services) {
      if (service.id && existingServiceIds.includes(service.id)) {
        await tx
          .update(invoiceServicesTable)
          .set({
            description: service.description,
            amount: String(service.amount),
            vatRate: String(service.vatRate || 0),
            quantity: service.quantity,
            unit: service.unit
          })
          .where(eq(invoiceServicesTable.id, service.id));
      } else {
        await tx.insert(invoiceServicesTable).values({
          description: service.description,
          amount: String(service.amount),
          vatRate: String(service.vatRate || 0),
          quantity: service.quantity,
          unit: service.unit,
          invoiceId: id
        });
      }
    }

    return getInvoiceFromDb(userId, id);
  });

  return updatedInvoice;
};

export async function updateInvoiceStatusInDb(
  userId: number,
  id: number,
  status: 'paid' | 'pending' | 'canceled'
): Promise<{ id: number } | undefined> {
  const timestampUpdates =
    status === 'paid'
      ? { paidAt: new Date().toISOString(), voidedAt: null }
      : status === 'canceled'
        ? { paidAt: null, voidedAt: new Date().toISOString() }
        : { paidAt: null, voidedAt: null };

  const invoices = await db
    .update(invoicesTable)
    .set({ status, ...timestampUpdates })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
}

export async function prepareInvoiceSigningFromDb({
  userId,
  id,
  token,
  recipientEmail,
  expiresAt
}: {
  userId: number;
  id: number;
  token: string;
  recipientEmail: string;
  expiresAt: string;
}): Promise<
  | {
      id: number;
      recipientSigningToken: string | null;
    }
  | undefined
> {
  const invoices = await db
    .update(invoicesTable)
    .set({
      recipientSigningToken: sql<string>`COALESCE(${invoicesTable.recipientSigningToken}, ${token})`,
      recipientSigningEmail: sql<string>`COALESCE(${invoicesTable.recipientSigningEmail}, ${recipientEmail})`,
      recipientSigningCreatedAt: sql<string>`COALESCE(${invoicesTable.recipientSigningCreatedAt}, ${new Date().toISOString()})`,
      recipientSigningExpiresAt: sql<string>`COALESCE(${invoicesTable.recipientSigningExpiresAt}, ${expiresAt})`
    })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({
      id: invoicesTable.id,
      recipientSigningToken: invoicesTable.recipientSigningToken
    });

  return invoices.at(0);
}

export async function revokeInvoiceSigningFromDb({
  userId,
  id
}: {
  userId: number;
  id: number;
}): Promise<{ id: number } | undefined> {
  const invoices = await db
    .update(invoicesTable)
    .set({ recipientSigningRevokedAt: new Date().toISOString() })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
}

export async function regenerateInvoiceSigningFromDb({
  userId,
  id,
  token,
  recipientEmail,
  expiresAt
}: {
  userId: number;
  id: number;
  token: string;
  recipientEmail: string;
  expiresAt: string;
}): Promise<{ id: number } | undefined> {
  const now = new Date().toISOString();
  const invoices = await db
    .update(invoicesTable)
    .set({
      recipientSigningToken: token,
      recipientSigningEmail: recipientEmail,
      recipientSigningCreatedAt: now,
      recipientSigningExpiresAt: expiresAt,
      recipientSigningRevokedAt: null,
      recipientSigningSentAt: null
    })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
}

export async function markInvoiceSigningSentInDb({
  userId,
  id
}: {
  userId: number;
  id: number;
}): Promise<{ id: number } | undefined> {
  const now = new Date().toISOString();
  const invoices = await db
    .update(invoicesTable)
    .set({
      lifecycleStatus: 'issued',
      issuedAt: sql<string>`COALESCE(${invoicesTable.issuedAt}, ${now})`,
      recipientSigningSentAt: now
    })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
}

type PublicInvoiceSigningFromDb = Omit<
  PublicInvoiceSigning,
  'invoice' | 'token'
> & {
  invoice: InvoiceFromDb;
};

export async function getPublicInvoiceSigningFromDb(
  token: string
): Promise<PublicInvoiceSigningFromDb | undefined> {
  const rows = await db
    .select({
      id: invoicesTable.id,
      userId: invoicesTable.userId,
      currency: usersTable.currency,
      language: usersTable.language,
      preferredInvoiceLanguage: usersTable.preferredInvoiceLanguage
    })
    .from(invoicesTable)
    .innerJoin(usersTable, eq(invoicesTable.userId, usersTable.id))
    .where(eq(invoicesTable.recipientSigningToken, token))
    .limit(1);
  const row = rows.at(0);

  if (!row) return undefined;

  const invoice = await getInvoiceFromDb(row.userId, row.id);

  if (!invoice) return undefined;

  return {
    invoice,
    currency: row.currency,
    language: row.language,
    preferredInvoiceLanguage: row.preferredInvoiceLanguage
  };
}

export async function signInvoiceByRecipientTokenInDb({
  token,
  receiverSignature
}: {
  token: string;
  receiverSignature: string;
}): Promise<InvoiceFromDb | null | undefined> {
  const invoices = await db
    .update(invoicesTable)
    .set({
      receiverSignature,
      recipientSignedAt: new Date().toISOString(),
      recipientSigningExpiresAt: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString()
    })
    .where(
      and(
        eq(invoicesTable.recipientSigningToken, token),
        isNull(invoicesTable.recipientSignedAt),
        isNull(invoicesTable.recipientSigningRevokedAt),
        or(
          isNull(invoicesTable.recipientSigningExpiresAt),
          gt(invoicesTable.recipientSigningExpiresAt, new Date().toISOString())
        )
      )
    )
    .returning({
      id: invoicesTable.id,
      userId: invoicesTable.userId
    });
  const invoice = invoices.at(0);

  if (!invoice) return null;

  return getInvoiceFromDb(invoice.userId, invoice.id);
}

export const deleteInvoiceFromDb = async (
  userId: number,
  invoiceId: number
): Promise<{ id: number } | undefined> => {
  const invoices = await db
    .delete(invoicesTable)
    .where(
      and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
    )
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
};

export const getInvoicesTotalAmountFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      subtotalAmount: invoicesTable.subtotalAmount,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status
    })
    .from(invoicesTable)
    .where(eq(invoicesTable.userId, userId));

  return invoices;
};

export const getInvoicesRevenueFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      subtotalAmount: invoicesTable.subtotalAmount,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      date: invoicesTable.date
    })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.status, 'paid'),
        gte(invoicesTable.date, sql`NOW() - INTERVAL '1 year'`)
      )
    );

  return invoices;
};

export const getLatestInvoicesFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      id: invoicesTable.id,
      subtotalAmount: invoicesTable.subtotalAmount,
      vatAmount: invoicesTable.vatAmount,
      totalAmount: invoicesTable.totalAmount,
      invoiceId: invoicesTable.invoiceId,
      name: invoiceReceiversTable.name,
      email: invoiceReceiversTable.email
    })
    .from(invoicesTable)
    .where(eq(invoicesTable.userId, userId))
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .orderBy(desc(invoicesTable.id))
    .limit(5);

  return invoices;
};
