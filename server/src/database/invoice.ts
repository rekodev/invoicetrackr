import { InvoiceDto } from '../types/dtos';
import { InvoiceModel, InvoiceService } from '../types/models';
import { sql } from './db';

export const findInvoiceById = async (userId: number, id: number) => {
  const [invoice] = await sql`
    select
      id
    from invoices
    where sender_id = ${userId} and id = ${id}
  `;

  return invoice;
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
      invoices.sender_signature,
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

export const getInvoiceFromDb = async (userId: number, invoiceId: number) => {
  const [invoice] = await sql<Array<InvoiceDto>>`
    select
      invoices.id,
      invoices.invoice_id,
      invoices.date,
      invoices.total_amount,
      invoices.status,
      invoices.due_date,
      invoices.sender_signature,
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
    where invoices.sender_id = ${userId} and invoices.id = ${invoiceId}
    group by invoices.id, users.id, clients.id
    order by id desc
  `;

  return invoice;
};

export const insertInvoiceInDb = async (invoiceData: InvoiceModel) => {
  const invoice = await sql.begin<InvoiceDto>(async (sql) => {
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

  return invoice;
};

export const updateInvoiceInDb = async (
  userId: number,
  id: number,
  invoiceData: InvoiceModel,
  senderSignature: string
) => {
  const invoice = await sql.begin<InvoiceDto>(async (sql) => {
    const [invoice] = await sql`
      update invoices
      set
        invoice_id = ${invoiceData.invoiceId},
        sender_id = ${invoiceData.sender.id},
        receiver_id = ${invoiceData.receiver.id},
        date = ${invoiceData.date},
        due_date = ${invoiceData.dueDate},
        status = ${invoiceData.status},
        total_amount = ${invoiceData.totalAmount},
        sender_signature = ${senderSignature}
      where sender_id = ${userId} and id = ${id}
      returning id
    `;

    if (!invoice) return null;

    const existingServices = await sql`
      select 
        id
      from invoice_services
      where invoice_id = ${invoiceData.id}
    `;

    const existingServiceIds = existingServices.map((service) => service.id);
    const newServiceIds = invoiceData.services.map((service) => service.id);

    const servicesToDelete = existingServiceIds.filter(
      (id) => !newServiceIds.includes(id)
    );
    if (servicesToDelete.length) {
      await sql`
        delete from invoice_services where id = ANY(${servicesToDelete})
      `;
    }

    for (const service of invoiceData.services) {
      if (existingServiceIds.includes(service.id)) {
        await sql`
          update invoice_services
          set
            description = ${service.description},
            amount = ${service.amount},
            quantity = ${service.quantity},
            unit = ${service.unit}
          where id = ${service.id}
        `;
      } else {
        await sql`
          insert into invoice_services
            (description, amount, quantity, unit, invoice_id)
          values
            (${service.description}, ${service.amount}, ${service.quantity}, ${service.unit}, ${invoiceData.id})
        `;
      }
    }

    return getInvoiceFromDb(userId, invoiceData.id);
  });

  return invoice;
};

export const deleteInvoiceFromDb = async (
  userId: number,
  invoiceId: number
) => {
  const invoice = await sql.begin<{ id: number }>(async (sql) => {
    const services: Array<InvoiceService> = await sql`
      delete from invoice_services
      where invoice_id = ${invoiceId}
      returning id
    `;

    if (!services.length) return;

    const [invoice] = await sql`
      delete from invoices
      where id = ${invoiceId} and sender_id = ${userId}
      returning id
    `;

    if (!invoice) return;

    return invoice.id;
  });

  return invoice;
};
