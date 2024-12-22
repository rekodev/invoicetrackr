import { and, desc, eq, inArray } from 'drizzle-orm';

import { InvoiceDto } from '../types/dtos';
import { InvoiceModel } from '../types/models';
import { db, sql } from './db';
import {
  bankingInformationTable,
  clientsTable,
  invoiceServicesTable,
  invoicesTable,
  usersTable,
} from './schema';
import { jsonAgg } from '../utils/jsonAgg';

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

export const getInvoiceFromDb = async (userId: number, invoiceId: number) => {
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
    .where(
      and(eq(invoicesTable.senderId, userId), eq(invoicesTable.id, invoiceId))
    )
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
  const invoice = await sql.begin<InvoiceDto>(async (sql) => {
    const [invoice] = await sql`
      insert into invoices (
        date, invoice_id, total_amount, status, due_date, sender_id, receiver_id, sender_signature, bank_account_id
      ) values (
        ${invoiceData.date}, ${invoiceData.invoiceId}, ${invoiceData.totalAmount}, ${invoiceData.status}, 
        ${invoiceData.dueDate}, ${invoiceData.sender.id}, ${invoiceData.receiver.id}, ${senderSignature}, ${invoiceData.bankingInformation.id}
      ) returning id
    `;

    for (const service of invoiceData.services) {
      await sql`
        insert into invoice_services (
          description, amount, quantity, unit, invoice_id
        ) values (
          ${service.description}, ${service.amount}, ${service.quantity}, 
          ${service.unit}, ${invoice.id}
        )
      `;
    }

    const [insertedInvoice] = await sql<Array<InvoiceDto>>`
      select
        invoices.id,
        invoices.invoice_id,
        invoices.date,
        invoices.total_amount,
        invoices.status,
        invoices.due_date,
        banking_information.id as bank_account_id,
        banking_information.name as bank_account_name,
        banking_information.account_number as bank_account_number,
        banking_information.code as bank_account_code,
        users.id as sender_id,
        users.name as sender_name,
        users.type as sender_type,
        users.business_type as sender_business_type,
        users.business_number as sender_business_number,
        users.address as sender_address,
        users.email as sender_email,
        clients.id as receiver_id,
        clients.name as receiver_name,
        clients.type as receiver_type,
        clients.business_type as receiver_business_type,
        clients.business_number as receiver_business_number,
        clients.address as receiver_address,
        clients.email as receiver_email,
        json_agg(
          json_build_object(
            'id', invoice_services.id,
            'description', invoice_services.description,
            'amount', invoice_services.amount,
            'quantity', invoice_services.quantity,
            'unit', invoice_services.unit
          )
        ) as services
      from 
        invoices
      left join users on invoices.sender_id = users.id
      left join clients on invoices.receiver_id = clients.id
      left join banking_information on invoices.bank_account_id = banking_information.id
      left join invoice_services on invoice_services.invoice_id = invoices.id
      where invoices.id = ${invoice.id}
      group by invoices.id, users.id, clients.id, banking_information.id
    `;

    return insertedInvoice;
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
