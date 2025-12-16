import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { InvoiceBody } from '@invoicetrackr/types';

import {
  bankingInformationTable,
  invoiceBankingInformationTable,
  invoiceReceiversTable,
  invoiceSendersTable,
  invoiceServicesTable,
  invoicesTable
} from './schema';
import { db } from './db';
import { jsonAgg } from '../utils/json';

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
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status,
      dueDate: invoicesTable.dueDate,
      senderSignature: invoicesTable.senderSignature,
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
        unit: invoiceServicesTable.unit
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
  transaction?: Parameters<Parameters<typeof db.transaction>[0]>[0]
): Promise<InvoiceFromDb | undefined> => {
  const invoices = await (transaction ? transaction : db)
    .select({
      id: invoicesTable.id,
      invoiceId: invoicesTable.invoiceId,
      date: invoicesTable.date,
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status,
      dueDate: invoicesTable.dueDate,
      senderSignature: invoicesTable.senderSignature,
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
        unit: invoiceServicesTable.unit
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
    // Invoice insert
    const invoices = await tx
      .insert(invoicesTable)
      .values({
        userId,
        date: invoiceData.date,
        invoiceId: invoiceData.invoiceId,
        totalAmount: String(invoiceData.totalAmount),
        status: invoiceData.status,
        dueDate: invoiceData.dueDate,
        senderSignature: senderSignature
      })
      .returning({ id: invoicesTable.id });

    const insertedInvoiceId = invoices.at(0)?.id;

    if (!insertedInvoiceId) throw new Error('Failed to insert invoice');

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
    // Get the current invoice to access senderId, receiverId, and bankAccountId
    const currentInvoice = await tx
      .select({
        senderId: invoicesTable.senderId,
        receiverId: invoicesTable.receiverId,
        bankAccountId: invoicesTable.bankAccountId
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
        totalAmount: String(invoiceData.totalAmount),
        senderSignature
      })
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.id, id)))
      .returning({ id: invoicesTable.id });

    if (!invoices[0]) return null;

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
            quantity: service.quantity,
            unit: service.unit
          })
          .where(eq(invoiceServicesTable.id, service.id));
      } else {
        await tx.insert(invoiceServicesTable).values({
          description: service.description,
          amount: String(service.amount),
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
  const invoices = await db
    .update(invoicesTable)
    .set({ status })
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });

  return invoices.at(0);
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
