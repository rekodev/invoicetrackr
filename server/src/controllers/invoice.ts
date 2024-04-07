import { FastifyReply, FastifyRequest } from 'fastify';
import { InvoiceModel } from '../types/models/invoice';

export const getInvoices = (req: FastifyRequest, reply: FastifyReply) => {
  reply.send([]);
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
