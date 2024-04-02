import {
  deleteInvoice,
  getInvoice,
  getInvoices,
  postInvoice,
  updateInvoice,
} from '../controllers/invoice';
import {
  InvoiceModel,
  InvoiceParty,
  InvoiceService,
} from '../types/models/invoice';

const Receiver = {
  type: 'object',
  properties: <Record<keyof InvoiceParty, { type: string }>>{
    address: { type: 'string' },
    businessNumber: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
  },
};

const Sender = Receiver;

const Service = {
  type: 'object',
  properties: <Record<keyof InvoiceService, { type: string }>>{
    amount: { type: 'number' },
    description: { type: 'string' },
    quantity: { type: 'number' },
    unit: { type: 'number' },
  },
};

const Invoice = {
  type: 'object',
  properties: <
    Record<
      keyof InvoiceModel,
      { type: string } | typeof Receiver | typeof Service
    >
  >{
    id: { type: 'number' },
    invoiceId: { type: 'string' },
    company: { type: 'string' },
    date: { type: 'string' },
    dueDate: { type: 'string' },
    receiver: Receiver,
    sender: Sender,
    status: { type: 'string' },
    services: Service,
    totalAmount: { type: 'number' },
  },
};

export const getInvoicesOptions = {
  schema: {
    response: {
      200: {
        type: 'array',
        invoices: Invoice,
      },
    },
  },
  handler: getInvoices,
};

export const getInvoiceOptions = {
  schema: {
    response: {
      200: Invoice,
    },
  },
  handler: getInvoice,
};

export const postInvoiceOptions = {
  schema: {
    body: {
      type: 'object',
      required: [
        'id',
        'company',
        'date',
        'dueDate',
        'receiver',
        'sender',
        'status',
        'services',
        'totalAmount',
      ],
      properties: <
        Record<
          keyof InvoiceModel,
          { type: string } | typeof Receiver | typeof Service
        >
      >{
        id: { type: 'string' },
        company: { type: 'string' },
        date: { type: 'string' },
        dueDate: { type: 'string' },
        receiver: Receiver,
        sender: Sender,
        status: { type: 'string' },
        services: Service,
        totalAmount: { type: 'number' },
      },
    },
    response: {
      201: Invoice,
    },
  },
  handler: postInvoice,
};

export const updateInvoiceOptions = {
  schema: {
    response: {
      200: Invoice,
    },
  },
  handler: updateInvoice,
};

export const deleteInvoiceOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: deleteInvoice,
};
