import { InvoiceDto } from '../src/types/dtos/invoice';
import { InvoiceModel } from '../src/types/models/invoice';
import { sql } from './db';

export const findClientByInvoiceId = async (
  userId: number,
  invoiceId: string
) => {
  const invoices = await sql`
    select
      invoice_id
    from invoices
    where user_id = ${userId} and invoice_id = ${invoiceId}
  `;

  return invoices;
};

export const getInvoicesFromDb = async (userId: number) => {
  const invoices = await sql`
    select
      invoices.id,
      invoices.invoice_id,
      invoices.date,
      invoices.total_amount,
      invoices.status,
      invoices.due_date,
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
    left join invoice_services on invoice_services.invoice_id = invoices.id
    where invoices.sender_id = ${userId}
    group by invoices.id, users.id, clients.id
    order by id desc
  `;

  return invoices;
};

export const insertInvoiceInDb = async (invoiceData: InvoiceModel) => {
  const invoiceDto = await sql.begin<InvoiceDto>(async (sql) => {
    const [invoice] = await sql`
      insert into invoices (
        date, invoice_id, total_amount, status, due_date, sender_id, receiver_id
      ) values (
        ${invoiceData.date}, ${invoiceData.invoiceId}, ${invoiceData.totalAmount}, ${invoiceData.status}, 
        ${invoiceData.dueDate}, ${invoiceData.sender.id}, ${invoiceData.receiver.id}
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
      left join invoice_services on invoice_services.invoice_id = invoices.id
      where invoices.id = ${invoice.id}
      group by invoices.id, users.id, clients.id
    `;

    return insertedInvoice;
  });

  return invoiceDto;
};
