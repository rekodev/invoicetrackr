import {
  InvoiceBody,
  InvoiceReceiverBody,
  InvoiceSenderBody,
  InvoiceServiceBody
} from '@invoicetrackr/types';
import { Factory } from 'fishery';
import { InvoiceFromDb } from '../../database/invoice';
import { bankingInformationFactory } from './banking-information';

export const invoiceFactory = Factory.define<InvoiceBody>(({ sequence }) => ({
  id: sequence,
  date: new Date().toISOString().split('T')[0],
  userId: 1,
  senderId: 1,
  receiverId: 1,
  totalAmount: '1000.00',
  status: 'pending',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
  invoiceId: `INV-${sequence}`,
  senderSignature: `signature${sequence}.png`,
  bankAccountId: 1,
  bankingInformation: bankingInformationFactory.build(),
  receiver: invoiceReceiverFactory.build(),
  sender: invoiceSenderFactory.build(),
  services: [invoiceServiceFactory.build()]
}));

export const invoiceFromDbFactory = Factory.define<InvoiceFromDb>(
  ({ sequence }) => ({
    id: sequence,
    date: new Date().toISOString().split('T')[0],
    totalAmount: '1000.00',
    status: 'pending',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    invoiceId: `INV-${sequence}`,
    senderSignature: `signature${sequence}.png`,
    bankingInformation: {
      id: sequence,
      code: `CODE${sequence}`,
      name: `Bank ${sequence}`,
      accountNumber: `ACC${sequence}`
    },
    receiver: {
      id: sequence,
      type: 'receiver',
      name: `Receiver ${sequence}`,
      businessType: 'individual',
      businessNumber: `BN${sequence}`,
      vatNumber: null,
      address: `${sequence} Receiver Street`,
      email: ''
    },
    sender: {
      id: sequence,
      type: 'sender',
      name: `Sender ${sequence}`,
      businessType: 'individual',
      businessNumber: `BN${sequence}`,
      vatNumber: null,
      address: `${sequence} Sender Street`,
      email: 'test@gmail.com'
    },
    services: [
      {
        id: sequence,
        description: `Service ${sequence}`,
        unit: 'hour',
        quantity: 10,
        amount: '100.00'
      }
    ]
  })
);

export const invoiceReceiverFactory = Factory.define<InvoiceReceiverBody>(
  ({ sequence }) => ({
    id: sequence,
    type: 'receiver',
    name: `Receiver ${sequence}`,
    businessType: 'individual',
    businessNumber: `BN${sequence}`,
    vatNumber: null,
    address: `${sequence} Receiver Street`,
    email: ''
  })
);

export const invoiceSenderFactory = Factory.define<InvoiceSenderBody>(
  ({ sequence }) => ({
    id: sequence,
    type: 'sender',
    name: `Sender ${sequence}`,
    businessType: 'individual',
    businessNumber: `BN${sequence}`,
    vatNumber: null,
    address: `${sequence} Sender Street`,
    email: 'test@gmail.com'
  })
);

export const invoiceServiceFactory = Factory.define<InvoiceServiceBody>(
  ({ sequence }) => ({
    id: sequence,
    description: `Service ${sequence}`,
    unit: 'hour',
    quantity: 10,
    amount: 100
  })
);
