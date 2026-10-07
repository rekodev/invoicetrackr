import type { InvoiceListItem } from '@invoicetrackr/types';

import { INVOICES_PAGE } from '@/lib/constants/pages';

import { getInvoiceDueStatus, getInvoicePaymentStatus } from './invoice';

export const INVOICE_STATUS_FILTERS = [
  'all',
  'open',
  'draft',
  'partial',
  'no_payment_due',
  'paid',
  'canceled',
  'pending'
] as const;

export type InvoiceListFilters = {
  filterValue: string;
  statusFilter: string;
  overdueOnly: boolean;
  issuedFrom: string;
  issuedTo: string;
  paidFrom: string;
  paidTo: string;
};

const isoDate = (value: string | null) =>
  value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    ? value
    : '';

export const readInvoiceListState = (
  params: URLSearchParams
): InvoiceListFilters => {
  const status = params.get('status') ?? '';

  return {
    filterValue: params.get('q') ?? '',
    statusFilter: INVOICE_STATUS_FILTERS.some((item) => item === status)
      ? status
      : 'all',
    overdueOnly: params.get('overdue') === '1',
    issuedFrom: isoDate(params.get('issuedFrom')),
    issuedTo: isoDate(params.get('issuedTo')),
    paidFrom: isoDate(params.get('paidFrom')),
    paidTo: isoDate(params.get('paidTo'))
  };
};

export const invoiceListHref = (values: Partial<Record<string, string>>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return `${INVOICES_PAGE}${query ? `?${query}` : ''}`;
};

export const writeInvoiceListState = (filters: InvoiceListFilters) =>
  invoiceListHref({
    q: filters.filterValue,
    status: filters.statusFilter === 'all' ? '' : filters.statusFilter,
    overdue: filters.overdueOnly ? '1' : '',
    issuedFrom: filters.issuedFrom,
    issuedTo: filters.issuedTo,
    paidFrom: filters.paidFrom,
    paidTo: filters.paidTo
  });

const inRange = (value: string, from: string, to: string) =>
  (!from || value >= from) && (!to || value <= to);

export const matchesInvoiceListFilters = (
  invoice: InvoiceListItem,
  filters: InvoiceListFilters
) => {
  const { filterValue, statusFilter, overdueOnly, issuedFrom, issuedTo, paidFrom, paidTo } =
    filters;
  const paymentStatus = getInvoicePaymentStatus(invoice);
  const matchesStatus =
    statusFilter === 'all' ||
    (statusFilter === 'canceled'
      ? invoice.lifecycleStatus === 'voided'
      : statusFilter === 'open'
        ? paymentStatus === 'pending' || paymentStatus === 'partial'
        : paymentStatus === statusFilter);

  return (
    (!filterValue ||
      `${invoice.invoiceId || ''} ${invoice.receiver.name}`
        .toLowerCase()
        .includes(filterValue.toLowerCase())) &&
    matchesStatus &&
    (!overdueOnly || getInvoiceDueStatus(invoice).isPastDue) &&
    (!(issuedFrom || issuedTo) ||
      (invoice.lifecycleStatus === 'issued' &&
        inRange(invoice.date, issuedFrom, issuedTo))) &&
    (!(paidFrom || paidTo) ||
      (invoice.paymentDates ?? []).some((date) => inRange(date, paidFrom, paidTo)))
  );
};
