import { ClientModel } from '../types/models/client';
import {
  InvoiceModel,
  InvoiceParty,
  InvoiceService,
} from '../types/models/invoice';

export const testSender: InvoiceParty = {
  address: '21 Jump St.',
  businessNumber: '123456789',
  name: 'John Doe',
  type: 'Irrelevant for now',
};

export const testReceiver = testSender;

export const testService: InvoiceService = {
  amount: 20,
  description: 'Frontend programming service',
  quantity: 1,
  unit: 'project',
};

export const invoices: Array<InvoiceModel> = [
  {
    id: 1,
    invoiceId: 'PRO123',
    date: '2024-03-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService, testService], // Assuming this is an array of ser
  },
  {
    id: 2,
    invoiceId: 'PRO175923',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 3,
    invoiceId: 'PRO1853',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 4,
    invoiceId: 'PRO175',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 5,
    invoiceId: 'PRO1245',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 6,
    invoiceId: 'PRO1247',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 7,
    invoiceId: 'PRO173',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 8,
    invoiceId: 'PRO18124',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 9,
    invoiceId: 'PRO103',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 10,
    invoiceId: 'PRO183',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 11,
    invoiceId: 'PRO153',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 12,
    invoiceId: 'PRO1623',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 13,
    invoiceId: 'PRO1213',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 14,
    invoiceId: 'PRO1233',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
  {
    id: 15,
    invoiceId: 'PRO124',
    date: '2024-02-24',
    company: 'Company 2',
    totalAmount: 300, // Assuming totalAmount corresponds to price
    status: 'paid',
    sender: testSender,
    receiver: testReceiver,
    dueDate: '2024-03-26', // Example due date, adjust as necessary
    services: [testService], // Assuming this is an array of ser
  },
];

export const clients: Array<ClientModel> = [
  {
    id: 1,
    address: '21 Jump St.',
    businessNumber: '123456789',
    businessType: 'business',
    name: 'John Doe',

    type: 'receiver',
  },
  {
    id: 2,
    address: '47 Elm St.',
    businessNumber: '987654321',
    businessType: 'individual',
    name: 'Jane',
    type: 'receiver',
  },
  {
    id: 3,
    address: '84 Oak Ave.',
    businessNumber: '192837465',
    businessType: 'business',
    name: 'Alice',
    type: 'receiver',
  },
  {
    id: 4,
    address: '32 Maple Rd.',
    businessNumber: '564738291',
    businessType: 'individual',
    name: 'Bob',
    type: 'receiver',
  },
  {
    id: 5,
    address: '98 Pine St.',
    businessNumber: '374829165',
    businessType: 'business',
    name: 'Charlie',
    type: 'receiver',
  },
  {
    id: 6,
    address: '98 Pine St.',
    businessNumber: '372359165',
    businessType: 'business',
    name: 'Charlize',
    type: 'receiver',
  },
  {
    id: 7,
    address: '98 Pine St.',
    businessNumber: '374829165',
    businessType: 'business',
    name: 'Charlie',
    type: 'receiver',
  },
  {
    id: 8,
    address: '98 Pine St.',
    businessNumber: '374829165',
    businessType: 'business',
    name: 'EDIGINO',
    type: 'receiver',
  },
  {
    id: 9,
    address: '98 Pine St.',
    businessNumber: '374829165',
    businessType: 'business',
    name: 'Charlie Hello',
    type: 'receiver',
  },
  {
    id: 10,
    address: '98 Pine St.',
    businessNumber: '374829165',
    businessType: 'business',
    name: 'Charlie Whatever',
    type: 'receiver',
  },
];
