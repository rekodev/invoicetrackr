import { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceModel } from '../types/models/invoice';
import { getInvoicesFromDb } from '../../database/invoice';
import { transformInvoiceDto } from '../types/transformers/invoice';
import { InvoiceDto } from '../types/dtos/invoice';

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  console.log(userId);
  const invoices = await getInvoicesFromDb(userId);

  console.log(invoices);
  reply.send(
    invoices.map((invoice) => transformInvoiceDto(invoice as InvoiceDto))
  );
};

export const getInvoice = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const postInvoice = (
  req: FastifyRequest<{ Body: InvoiceModel }>,
  reply: FastifyReply
) => {
  const {
    id,
    company,
    date,
    dueDate,
    receiver,
    sender,
    services,
    status,
    totalAmount,
  } = req.body;
};

export const updateInvoice = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const deleteInvoice = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};
