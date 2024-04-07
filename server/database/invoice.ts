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
      invoices.company,
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

export const insertInvoiceData = (invoiceData: InvoiceModel) => {};
