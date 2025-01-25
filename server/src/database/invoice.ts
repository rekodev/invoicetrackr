import {
  and,
  desc,
  eq,
  ExtractTablesWithRelations,
  gte,
  inArray,
  sql,
} from "drizzle-orm";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";

import { InvoiceModel } from "../types/models";
import { jsonAgg } from "../utils/jsonAgg";
import { db } from "./db";
import {
  invoiceBankingInformationTable,
  invoiceReceiversTable,
  invoiceSendersTable,
  invoiceServicesTable,
  invoicesTable,
} from "./schema";

export const findInvoiceById = async (userId: number, id: number) => {
  const invoices = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.senderId, userId)));

  return invoices.at(0);
};

export const findInvoiceByInvoiceId = async (
  userId: number,
  invoiceId: string,
) => {
  const invoices = await db
    .select({ id: invoicesTable.id })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.invoiceId, invoiceId),
        eq(invoicesTable.senderId, userId),
      ),
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
        accountNumber: invoiceBankingInformationTable.accountNumber,
      },
      sender: {
        id: invoiceSendersTable.id,
        name: invoiceSendersTable.name,
        type: invoiceSendersTable.type,
        businessType: invoiceSendersTable.businessType,
        businessNumber: invoiceSendersTable.businessNumber,
        address: invoiceSendersTable.address,
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
        address: invoiceReceiversTable.address,
        email: invoiceReceiversTable.email,
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
    .leftJoin(
      invoiceSendersTable,
      eq(invoicesTable.senderId, invoiceSendersTable.id),
    )
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id),
    )
    .leftJoin(
      invoiceBankingInformationTable,
      eq(invoicesTable.bankAccountId, invoiceBankingInformationTable.id),
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id),
    )
    .where(eq(invoicesTable.senderId, userId))
    .groupBy(
      invoicesTable.id,
      invoiceSendersTable.id,
      invoiceReceiversTable.id,
      invoiceBankingInformationTable.id,
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
  >,
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
        accountNumber: invoiceBankingInformationTable.accountNumber,
      },
      sender: {
        id: invoiceSendersTable.id,
        name: invoiceSendersTable.name,
        type: invoiceSendersTable.type,
        businessType: invoiceSendersTable.businessType,
        businessNumber: invoiceSendersTable.businessNumber,
        address: invoiceSendersTable.address,
        email: invoiceSendersTable.email,
      },
      receiver: {
        id: invoiceReceiversTable.id,
        name: invoiceReceiversTable.name,
        type: invoiceReceiversTable.type,
        businessType: invoiceReceiversTable.businessType,
        businessNumber: invoiceReceiversTable.businessNumber,
        address: invoiceReceiversTable.address,
        email: invoiceReceiversTable.email,
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
    .leftJoin(
      invoiceSendersTable,
      eq(invoicesTable.senderId, invoiceSendersTable.id),
    )
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id),
    )
    .leftJoin(
      invoiceBankingInformationTable,
      eq(invoicesTable.bankAccountId, invoiceBankingInformationTable.id),
    )
    .leftJoin(
      invoiceServicesTable,
      eq(invoiceServicesTable.invoiceId, invoicesTable.id),
    )
    .where(and(eq(invoicesTable.senderId, userId), eq(invoicesTable.id, id)))
    .groupBy(
      invoicesTable.id,
      invoiceSendersTable.id,
      invoiceReceiversTable.id,
      invoiceBankingInformationTable.id,
    );

  return invoices.at(0);
};

export const insertInvoiceInDb = async (
  invoiceData: InvoiceModel,
  senderSignature: string,
) => {
  const invoice = await db.transaction(async (tx) => {
    // Invoice insert
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

    // Invoice sender insert
    await tx
      .insert(invoiceSendersTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.sender.name,
        email: invoiceData.sender.email,
        address: invoiceData.sender.address,
        type: invoiceData.sender.type,
        businessType: invoiceData.sender.businessType,
        businessNumber: invoiceData.sender.businessNumber,
      })
      .returning({ id: invoiceSendersTable.id });

    // Invoice receiver insert
    await tx
      .insert(invoiceReceiversTable)
      .values({
        invoiceId: insertedInvoiceId,
        name: invoiceData.receiver.name,
        email: invoiceData.receiver.email,
        address: invoiceData.receiver.address,
        type: invoiceData.receiver.type,
        businessType: invoiceData.receiver.businessType,
        businessNumber: invoiceData.receiver.businessNumber,
      })
      .returning({ id: invoiceReceiversTable.id });

    // Invoice banking information insert
    await tx.insert(invoiceBankingInformationTable).values({
      invoiceId: insertedInvoiceId,
      accountName: invoiceData.bankingInformation.name,
      accountNumber: invoiceData.bankingInformation.accountNumber,
      bankCode: invoiceData.bankingInformation.code,
    });

    // Invoice services insert
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
      tx,
    );

    return !!insertedInvoice?.services.length ? insertedInvoice : null;
  });

  return invoice;
};

export const updateInvoiceInDb = async (
  userId: number,
  id: number,
  invoiceData: InvoiceModel,
  senderSignature: string,
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

    // Updating sender information
    const currentSender = await tx
      .select()
      .from(invoiceSendersTable)
      .where(eq(invoiceSendersTable.invoiceId, id));

    if (currentSender.length > 0) {
      await tx
        .update(invoiceSendersTable)
        .set({
          name: invoiceData.sender.name,
          email: invoiceData.sender.email,
          address: invoiceData.sender.address,
          type: invoiceData.sender.type,
          businessType: invoiceData.sender.businessType,
          businessNumber: invoiceData.sender.businessNumber,
        })
        .where(eq(invoiceSendersTable.invoiceId, id));
    } else {
      await tx.insert(invoiceSendersTable).values({
        invoiceId: id,
        name: invoiceData.sender.name,
        email: invoiceData.sender.email,
        address: invoiceData.sender.address,
        type: invoiceData.sender.type,
        businessType: invoiceData.sender.businessType,
        businessNumber: invoiceData.sender.businessNumber,
      });
    }

    // Updating receiver information
    const currentReceiver = await tx
      .select()
      .from(invoiceReceiversTable)
      .where(eq(invoiceReceiversTable.invoiceId, id));

    if (currentReceiver.length > 0) {
      await tx
        .update(invoiceReceiversTable)
        .set({
          name: invoiceData.receiver.name,
          email: invoiceData.receiver.email,
          address: invoiceData.receiver.address,
          type: invoiceData.receiver.type,
          businessType: invoiceData.receiver.businessType,
          businessNumber: invoiceData.receiver.businessNumber,
        })
        .where(eq(invoiceReceiversTable.invoiceId, id));
    } else {
      await tx.insert(invoiceReceiversTable).values({
        invoiceId: id,
        name: invoiceData.receiver.name,
        email: invoiceData.receiver.email,
        address: invoiceData.receiver.address,
        type: invoiceData.receiver.type,
        businessType: invoiceData.receiver.businessType,
        businessNumber: invoiceData.receiver.businessNumber,
      });
    }

    // Updating banking information
    const currentBankInfo = await tx
      .select()
      .from(invoiceBankingInformationTable)
      .where(eq(invoiceBankingInformationTable.invoiceId, id));

    if (currentBankInfo.length > 0) {
      await tx
        .update(invoiceBankingInformationTable)
        .set({
          accountName: invoiceData.bankingInformation.name,
          accountNumber: invoiceData.bankingInformation.accountNumber,
          bankCode: invoiceData.bankingInformation.code,
        })
        .where(eq(invoiceBankingInformationTable.invoiceId, id));
    } else {
      await tx.insert(invoiceBankingInformationTable).values({
        invoiceId: id,
        accountName: invoiceData.bankingInformation.name,
        accountNumber: invoiceData.bankingInformation.accountNumber,
        bankCode: invoiceData.bankingInformation.code,
      });
    }

    // Updating services
    const existingServices = await tx
      .select({ id: invoiceServicesTable.id })
      .from(invoiceServicesTable)
      .where(eq(invoiceServicesTable.invoiceId, id));

    const existingServiceIds = existingServices.map((service) => service.id);
    const newServiceIds = invoiceData.services.map((service) => service.id);

    const servicesToDelete = existingServiceIds.filter(
      (serviceId) => !newServiceIds.includes(serviceId),
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
  invoiceId: number,
) => {
  const invoices = await db
    .delete(invoicesTable)
    .where(
      and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.senderId, userId)),
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

export const getInvoicesRevenueFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      totalAmount: invoicesTable.totalAmount,
      date: invoicesTable.date,
    })
    .from(invoicesTable)
    .where(
      and(
        eq(invoicesTable.senderId, userId),
        eq(invoicesTable.status, "paid"),
        gte(invoicesTable.date, sql`NOW() - INTERVAL '1 year'`),
      ),
    );

  return invoices;
};

export const getLatestInvoicesFromDb = async (userId: number) => {
  const invoices = await db
    .select({
      id: invoicesTable.id,
      totalAmount: invoicesTable.totalAmount,
      name: invoiceReceiversTable.name,
      email: invoiceReceiversTable.email,
    })
    .from(invoicesTable)
    .where(eq(invoicesTable.senderId, userId))
    .leftJoin(
      invoiceReceiversTable,
      eq(invoicesTable.receiverId, invoiceReceiversTable.id),
    )
    .orderBy(desc(invoicesTable.date))
    .limit(5);

  return invoices;
};
