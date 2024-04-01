import {
  InvoiceModel,
  InvoiceParty,
  InvoiceService,
} from '../types/models/invoice';

export const testSender: InvoiceParty = {
  address: '21 Jump St.',
  businessNumber: '123456789',
  firstName: 'John',
  lastName: 'Doe',
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
