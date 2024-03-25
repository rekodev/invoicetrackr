import { invoices } from '../data';
import { InvoiceModel } from '../types/models/invoice';

export const getInvoices = (req, reply) => {
  reply.send(invoices);
};

export const getInvoice = (req, reply) => {
  const { id } = req.params;
};

export const postInvoice = (req, reply) => {
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
  } = <InvoiceModel>req.body;
};

export const updateInvoice = (req, reply) => {
  const { id } = req.params;
};

export const deleteInvoice = (req, reply) => {
  const { id } = req.params;
};
