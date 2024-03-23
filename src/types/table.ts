import { Key } from 'react';

export type InvoiceTableColumns = {
  name: string;
  role: string;
  status: string;
  actions: string;
};

export type InvoiceTableStatus = {
  name: string;
  uid: string;
};

export type SortDirection = 'ascending' | 'descending';
