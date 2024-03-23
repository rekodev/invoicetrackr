import { InvoiceModel } from '@/types/models/invoice';

const columns = [
  { name: 'ID', uid: 'id', sortable: true },
  { name: 'NAME', uid: 'name', sortable: true },
  { name: 'COMPANY', uid: 'company', sortable: true },
  { name: 'DATE', uid: 'date', sortable: true },
  { name: 'STATUS', uid: 'status', sortable: true },
  { name: 'ACTIONS', uid: 'actions' },
];

const statusOptions = [
  { name: 'Paid', uid: 'paid' },
  { name: 'Canceled', uid: 'canceled' },
  { name: 'Pending', uid: 'pending' },
];

const invoices: Array<InvoiceModel> = [
  {
    id: 1,
    name: 'Invoice 1',
    date: '2024-03-17',
    company: 'Company 1',
    status: 'canceled',
  },
  {
    id: 2,
    name: 'Invoice 2',
    date: '2024-02-24',
    company: 'Company 2',
    status: 'paid',
  },
  {
    id: 3,
    name: 'Invoice 3',
    date: '2024-03-07',
    company: 'Company 3',
    status: 'canceled',
  },
  {
    id: 4,
    name: 'Invoice 4',
    date: '2024-02-24',
    company: 'Company 4',
    status: 'canceled',
  },
  {
    id: 5,
    name: 'Invoice 5',
    date: '2024-03-04',
    company: 'Company 5',
    status: 'paid',
  },
  {
    id: 6,
    name: 'Invoice 1',
    date: '2024-03-17',
    company: 'Company 1',
    status: 'canceled',
  },
  {
    id: 7,
    name: 'Invoice 2',
    date: '2024-02-24',
    company: 'Company 2',
    status: 'paid',
  },
  {
    id: 8,
    name: 'Invoice 3',
    date: '2024-03-07',
    company: 'Company 3',
    status: 'canceled',
  },
  {
    id: 9,
    name: 'Invoice 4',
    date: '2024-02-24',
    company: 'Company 4',
    status: 'canceled',
  },
  {
    id: 10,
    name: 'Invoice 5',
    date: '2024-03-04',
    company: 'Company 5',
    status: 'paid',
  },
  {
    id: 11,
    name: 'Invoice 1',
    date: '2024-03-17',
    company: 'Company 1',
    status: 'canceled',
  },
  {
    id: 12,
    name: 'Invoice 2',
    date: '2024-02-24',
    company: 'Company 2',
    status: 'paid',
  },
  {
    id: 13,
    name: 'Invoice 3',
    date: '2024-03-07',
    company: 'Company 3',
    status: 'canceled',
  },
  {
    id: 14,
    name: 'Invoice 4',
    date: '2024-02-24',
    company: 'Company 4',
    status: 'canceled',
  },
  {
    id: 15,
    name: 'Invoice 5',
    date: '2024-03-04',
    company: 'Company 5',
    status: 'paid',
  },
];

export { columns, invoices, statusOptions };
