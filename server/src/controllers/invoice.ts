import { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceModel } from '../types/models/invoice';
import {
  deleteInvoiceFromDb,
  findInvoiceByInvoiceId,
  getInvoicesFromDb,
  insertInvoiceInDb,
} from '../../database/invoice';
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

  const foundInvoice = await findInvoiceByInvoiceId(
    invoiceData.sender.id,
    invoiceData.invoiceId
  );

  if (foundInvoice)
    return reply
      .status(403)
      .send({ message: 'Invoice with provided invoice ID already exists' });

  const insertedInvoice = await insertInvoiceInDb(invoiceData);

  if (!insertedInvoice)
    return reply.status(400).send({ message: 'Unable to add invoice' });

  reply.send({
    invoice: transformInvoiceDto(insertedInvoice),
    message: 'Invoice added successfully',
  });
};

export const updateInvoice = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const deleteInvoice = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const deletedInvoice = await deleteInvoiceFromDb(userId, id);

  if (!deletedInvoice)
    return reply.status(400).send({ message: 'Unable to delete invoice' });

  reply.send({ message: 'Invoice deleted successfully' });
};
