import {
  and,
  desc,
  eq,
  ExtractTablesWithRelations,
  gte,
  inArray,
  sql
} from 'drizzle-orm';
import { NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import { PgTransaction } from 'drizzle-orm/pg-core';

import { InvoiceModel } from '../types/models';
import { jsonAgg } from '../utils/json-agg';
import { db } from './db';
import {
  bankingInformationTable,
  invoiceBankingInformationTable,
  invoiceReceiversTable,
  invoiceSendersTable,
  invoiceServicesTable,
  invoicesTable
} from './schema';

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

export const getInvoicesFromDb = async (userId: number) => {
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
        address: invoiceSendersTable.address
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
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
  transaction?: PgTransaction<
    NeonQueryResultHKT,
    any,
    ExtractTablesWithRelations<Record<string, never>>
  >
) => {
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
        address: invoiceSendersTable.address,
        email: invoiceSendersTable.email
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
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
  invoiceData: InvoiceModel,
  userId: number,
  senderSignature: string
) => {
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
        senderId: null,
        receiverId: null,
        senderSignature: senderSignature,
        bankAccountId: null
      })
      .returning({ id: invoicesTable.id });

    const insertedInvoiceId = invoices.at(0).id;

    // Invoice sender insert
    const senders = await tx
      .insert(invoiceSendersTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.sender.name,
        email: invoiceData.sender.email,
        address: invoiceData.sender.address,
        type: invoiceData.sender.type,
        businessType: invoiceData.sender.businessType,
        businessNumber: invoiceData.sender.businessNumber
      })
      .returning({ id: invoiceSendersTable.id });

    // Invoice receiver insert
    const receivers = await tx
      .insert(invoiceReceiversTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.receiver.name,
        email: invoiceData.receiver.email,
        address: invoiceData.receiver.address,
        type: invoiceData.receiver.type,
        businessType: invoiceData.receiver.businessType,
        businessNumber: invoiceData.receiver.businessNumber
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
      .returning({ id: bankingInformationTable.id });

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
        senderId: senders.at(0).id,
        receiverId: receivers.at(0).id,
        bankAccountId: bankAccounts.at(0).id
      })
      .where(eq(invoicesTable.id, insertedInvoiceId));

    const insertedInvoice = await getInvoiceFromDb(
      userId,
      insertedInvoiceId,
      tx
    );

    return !!insertedInvoice?.services.length ? insertedInvoice : null;
  });

  return invoice;
};

export const updateInvoiceInDb = async (
  userId: number,
  id: number,
  invoiceData: InvoiceModel,
  senderSignature: string
) => {
  const updatedInvoice = await db.transaction(async (tx) => {
    let senderId = invoiceData.sender.id;
    const existingSender = await tx
      .select({ id: invoiceSendersTable.id })
      .from(invoiceSendersTable)
      .where(eq(invoiceSendersTable.invoiceId, id));

    if (existingSender.length > 0) {
      await tx
        .update(invoiceSendersTable)
        .set({
          name: invoiceData.sender.name,
          email: invoiceData.sender.email,
          address: invoiceData.sender.address,
          type: invoiceData.sender.type,
          businessType: invoiceData.sender.businessType,
          businessNumber: invoiceData.sender.businessNumber
        })
        .where(eq(invoiceSendersTable.invoiceId, id));
      senderId = existingSender[0].id;
    } else {
      const insertedSender = await tx
        .insert(invoiceSendersTable)
        .values({
          invoiceId: id,
          name: invoiceData.sender.name,
          email: invoiceData.sender.email,
          address: invoiceData.sender.address,
          type: invoiceData.sender.type,
          businessType: invoiceData.sender.businessType,
          businessNumber: invoiceData.sender.businessNumber
        })
        .returning({ id: invoiceSendersTable.id });
      senderId = insertedSender[0].id;
    }

    let receiverId = invoiceData.receiver.id;
    const existingReceiver = await tx
      .select({ id: invoiceReceiversTable.id })
      .from(invoiceReceiversTable)
      .where(eq(invoiceReceiversTable.invoiceId, id));

    if (existingReceiver.length > 0) {
      await tx
        .update(invoiceReceiversTable)
        .set({
          name: invoiceData.receiver.name,
          email: invoiceData.receiver.email,
          address: invoiceData.receiver.address,
          type: invoiceData.receiver.type,
          businessType: invoiceData.receiver.businessType,
          businessNumber: invoiceData.receiver.businessNumber
        })
        .where(eq(invoiceReceiversTable.invoiceId, id));
      receiverId = existingReceiver[0].id;
    } else {
      const insertedReceiver = await tx
        .insert(invoiceReceiversTable)
        .values({
          invoiceId: id,
          name: invoiceData.receiver.name,
          email: invoiceData.receiver.email,
          address: invoiceData.receiver.address,
          type: invoiceData.receiver.type,
          businessType: invoiceData.receiver.businessType,
          businessNumber: invoiceData.receiver.businessNumber
        })
        .returning({ id: invoiceReceiversTable.id });
      receiverId = insertedReceiver[0].id;
    }

    let bankAccountId = invoiceData.bankingInformation.id;
    const existingBankInfo = await tx
      .select({ id: invoiceBankingInformationTable.id })
      .from(invoiceBankingInformationTable)
      .where(eq(invoiceBankingInformationTable.invoiceId, id));

    if (existingBankInfo.length > 0) {
      await tx
        .update(invoiceBankingInformationTable)
        .set({
          accountName: invoiceData.bankingInformation.name,
          accountNumber: invoiceData.bankingInformation.accountNumber,
          bankCode: invoiceData.bankingInformation.code
        })
        .where(eq(invoiceBankingInformationTable.invoiceId, id));
      bankAccountId = existingBankInfo[0].id;
    } else {
      const insertedBankInfo = await tx
        .insert(invoiceBankingInformationTable)
        .values({
          invoiceId: id,
          accountName: invoiceData.bankingInformation.name,
          accountNumber: invoiceData.bankingInformation.accountNumber,
          bankCode: invoiceData.bankingInformation.code
        })
        .returning({ id: invoiceBankingInformationTable.id });
      bankAccountId = insertedBankInfo[0].id;
    }

    const invoices = await tx
      .update(invoicesTable)
      .set({
        userId,
        invoiceId: invoiceData.invoiceId,
        senderId,
        receiverId,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        totalAmount: String(invoiceData.totalAmount),
        senderSignature,
        bankAccountId
      })
      .where(and(eq(invoicesTable.userId, userId), eq(invoicesTable.id, id)))
      .returning({ id: invoicesTable.id });

    if (!invoices.at(0)) return null;

    const existingServices = await tx
      .select({ id: invoiceServicesTable.id })
      .from(invoiceServicesTable)
      .where(eq(invoiceServicesTable.invoiceId, id));

    const existingServiceIds = existingServices.map((service) => service.id);
    const newServiceIds = invoiceData.services.map((service) => service.id);

    const servicesToDelete = existingServiceIds.filter(
      (serviceId) => !newServiceIds.includes(serviceId)
    );

    if (servicesToDelete.length > 0) {
      await tx
        .delete(invoiceServicesTable)
        .where(inArray(invoiceServicesTable.id, servicesToDelete));
    }

    for (const service of invoiceData.services) {
      if (existingServiceIds.includes(service.id)) {
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
) {
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
) => {
  const invoices = await db
    .delete(invoicesTable)
    .where(
      and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, userId))
    )
    .returning({ id: invoiceServicesTable.id });

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
      name: invoiceReceiversTable.name,
      email: invoiceReceiversTable.email
    })
    .from(invoicesTable)
    .where(eq(invoicesTable.userId, userId))
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id)
    )
    .orderBy(desc(invoicesTable.date))
    .limit(5);

  return invoices;
};
