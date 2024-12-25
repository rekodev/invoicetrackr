import {
  and,
  desc,
  eq,
  ExtractTablesWithRelations,
  inArray,
} from 'drizzle-orm';
import { NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import { PgTransaction } from 'drizzle-orm/pg-core';

import { InvoiceModel } from '../types/models';
import { jsonAgg } from '../utils/jsonAgg';
import { db } from './db';
import {
  bankingInformationTable,
  clientsTable,
  invoiceServicesTable,
  invoicesTable,
  usersTable,
} from './schema';

export const findInvoiceById = async (userId: number, id: number) => {
  const invoices = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.senderId, userId)));

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
        eq(invoicesTable.senderId, userId)
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
        id: bankingInformationTable.id,
        code: bankingInformationTable.code,
        name: bankingInformationTable.name,
        accountNumber: bankingInformationTable.accountNumber,
      },
      sender: {
        id: usersTable.id,
        name: usersTable.name,
        type: usersTable.type,
        businessType: usersTable.businessType,
        businessNumber: usersTable.businessNumber,
        address: usersTable.address,
        email: usersTable.email,
        signature: usersTable.signature,
        profilePictureUrl: usersTable.profilePictureUrl,
        language: usersTable.language,
        currency: usersTable.currency,
      },
      receiver: {
        id: clientsTable.id,
        name: clientsTable.name,
        type: clientsTable.type,
        businessType: clientsTable.businessType,
        businessNumber: clientsTable.businessNumber,
        address: clientsTable.address,
        email: clientsTable.email,
      },
      services: jsonAgg({
        id: invoiceServicesTable.id,
        description: invoiceServicesTable.description,
        amount: invoiceServicesTable.amount,
        quantity: invoiceServicesTable.quantity,
        unit: invoiceServicesTable.unit,
      }),
    })
    .from(invoicesTable)
    .leftJoin(usersTable, eq(invoicesTable.senderId, usersTable.id))
    .leftJoin(clientsTable, eq(invoicesTable.receiverId, clientsTable.id))
    .leftJoin(
      bankingInformationTable,
      eq(invoicesTable.bankAccountId, bankingInformationTable.id)
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id)
    )
    .where(eq(invoicesTable.senderId, userId))
    .groupBy(
      invoicesTable.id,
      usersTable.id,
      clientsTable.id,
      bankingInformationTable.id
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
        id: bankingInformationTable.id,
        code: bankingInformationTable.code,
        name: bankingInformationTable.name,
        accountNumber: bankingInformationTable.accountNumber,
      },
      sender: {
        id: usersTable.id,
        name: usersTable.name,
        type: usersTable.type,
        businessType: usersTable.businessType,
        businessNumber: usersTable.businessNumber,
        address: usersTable.address,
        email: usersTable.email,
        signature: usersTable.signature,
        profilePictureUrl: usersTable.profilePictureUrl,
        language: usersTable.language,
        currency: usersTable.currency,
      },
      receiver: {
        id: clientsTable.id,
        name: clientsTable.name,
        type: clientsTable.type,
        businessType: clientsTable.businessType,
        businessNumber: clientsTable.businessNumber,
        address: clientsTable.address,
        email: clientsTable.email,
      },
      services: jsonAgg({
        id: invoiceServicesTable.id,
        description: invoiceServicesTable.description,
        amount: invoiceServicesTable.amount,
        quantity: invoiceServicesTable.quantity,
        unit: invoiceServicesTable.unit,
      }),
    })
    .from(invoicesTable)
    .leftJoin(usersTable, eq(invoicesTable.senderId, usersTable.id))
    .leftJoin(clientsTable, eq(invoicesTable.receiverId, clientsTable.id))
    .leftJoin(
      bankingInformationTable,
      eq(invoicesTable.bankAccountId, bankingInformationTable.id)
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id)
    )
    .where(and(eq(invoicesTable.senderId, userId), eq(invoicesTable.id, id)))
    .groupBy(
      invoicesTable.id,
      usersTable.id,
      clientsTable.id,
      bankingInformationTable.id
    );

  return invoices.at(0);
};

export const insertInvoiceInDb = async (
  invoiceData: InvoiceModel,
  senderSignature: string
) => {
  const invoice = await db.transaction(async (tx) => {
    const invoices = await tx
      .insert(invoicesTable)
      .values({
        date: invoiceData.date,
        invoiceId: invoiceData.invoiceId,
        totalAmount: String(invoiceData.totalAmount),
        status: invoiceData.status,
        dueDate: invoiceData.dueDate,
        senderId: invoiceData.sender.id,
        receiverId: invoiceData.receiver.id,
        senderSignature: senderSignature,
        bankAccountId: invoiceData.bankingInformation.id,
      })
      .returning({ id: invoicesTable.id });

    const insertedInvoiceId = invoices.at(0).id;

    for (const service of invoiceData.services) {
      await tx.insert(invoiceServicesTable).values({
        quantity: service.quantity,
        amount: String(service.amount),
        unit: service.unit,
        description: service.description,
        invoiceId: insertedInvoiceId,
      });
    }

    const insertedInvoice = await getInvoiceFromDb(
      invoiceData.sender.id,
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
    const invoices = await tx
      .update(invoicesTable)
      .set({
        invoiceId: invoiceData.invoiceId,
        senderId: invoiceData.sender.id,
        receiverId: invoiceData.receiver.id,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        totalAmount: String(invoiceData.totalAmount),
        senderSignature,
        bankAccountId: invoiceData.bankingInformation.id,
      })
      .where(and(eq(invoicesTable.senderId, userId), eq(invoicesTable.id, id)))
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
            unit: service.unit,
          })
          .where(eq(invoiceServicesTable.id, service.id));
      } else {
        await tx.insert(invoiceServicesTable).values({
          description: service.description,
          amount: String(service.amount),
          quantity: service.quantity,
          unit: service.unit,
          invoiceId: id,
        });
      }
    }

    return getInvoiceFromDb(userId, id);
  });

  return updatedInvoice;
};

export const deleteInvoiceFromDb = async (
  userId: number,
  invoiceId: number
) => {
  const invoices = await db
    .delete(invoicesTable)
    .where(
      and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.senderId, userId))
    )
    .returning({ id: invoiceServicesTable.id });

  return invoices.at(0);
};

export const getInvoicesTotalAmountFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      totalAmount: invoicesTable.totalAmount,
      status: invoicesTable.status,
    })
    .from(invoicesTable)
    .where(eq(invoicesTable.senderId, userId));

  return invoices;
};
