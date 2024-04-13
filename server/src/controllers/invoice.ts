import { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceModel } from '../types/models/invoice';
import { getInvoicesFromDb, insertInvoiceInDb } from '../../database/invoice';
import { transformInvoiceDto } from '../types/transformers/invoice';
import { InvoiceDto } from '../types/dtos/invoice';

export const getInvoices = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const invoices = await getInvoicesFromDb(userId);
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

export const postInvoice = async (
  req: FastifyRequest<{ Body: InvoiceModel }>,
  reply: FastifyReply
) => {
  const invoiceData = req.body;
  const insertionResult = await insertInvoiceInDb(invoiceData);

  if (!insertionResult)
    return reply.status(400).send({ message: 'Unable to add invoice' });

  reply.send({
    invoice: transformInvoiceDto(insertionResult),
    message: 'Invoice added successfully',
  });
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
