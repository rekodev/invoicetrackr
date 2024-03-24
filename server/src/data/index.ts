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
    id: 'PRO123',
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
    id: 'PRO175923',
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
    id: 'PRO1853',
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
    id: 'PRO175',
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
    id: 'PRO1245',
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
    id: 'PRO1247',
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
    id: 'PRO173',
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
    id: 'PRO18124',
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
    id: 'PRO103',
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
    id: 'PRO183',
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
    id: 'PRO153',
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
    id: 'PRO1623',
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
    id: 'PRO1213',
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
    id: 'PRO1233',
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
    id: 'PRO124',
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
