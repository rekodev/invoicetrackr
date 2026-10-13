import type {
  InvoiceListQuery,
  InvoiceListSort,
  InvoiceListStatus,
  ListSortDirection
} from '@invoicetrackr/types';

import { INVOICES_PAGE } from '@/lib/constants/pages';
import { DEFAULT_LIST_PAGE_SIZE, LIST_PAGE_SIZES } from '@/lib/constants/table';

export const INVOICE_STATUS_FILTERS: Array<InvoiceListStatus> = [
  'open',
  'draft',
  'partial',
  'no_payment_due',
  'paid',
  'canceled',
  'pending'
];

const INVOICE_SORTS: Array<InvoiceListSort> = [
  'id',
  'receiver',
  'totalAmount',
  'date',
  'lifecycleStatus',
  'status'
];

const DEFAULT_INVOICE_LIST_QUERY: InvoiceListQuery = {
  page: 1,
  pageSize: DEFAULT_LIST_PAGE_SIZE,
  sort: 'date',
  direction: 'descending'
};

type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;

const single = (value: SearchValue) =>
  typeof value === 'string' ? value : undefined;

const isoDate = (value: SearchValue) => {
  const date = single(value);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date))
    ? date
    : undefined;
};

const oneOf = <T extends string>(options: Array<T>, value: SearchValue) =>
  options.find((option) => option === single(value));

export const parseInvoiceListQuery = (params: SearchParams): InvoiceListQuery => {
  const page = Number(single(params.page));
  const pageSize = Number(single(params.pageSize));
  const q = single(params.q)?.trim().slice(0, 100);

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: LIST_PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_LIST_PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(oneOf(INVOICE_STATUS_FILTERS, params.status) && {
      status: oneOf(INVOICE_STATUS_FILTERS, params.status)
    }),
    ...(single(params.overdue) === '1' ? { overdue: '1' as const } : {}),
    ...(isoDate(params.issuedFrom) && { issuedFrom: isoDate(params.issuedFrom) }),
    ...(isoDate(params.issuedTo) && { issuedTo: isoDate(params.issuedTo) }),
    ...(isoDate(params.paidFrom) && { paidFrom: isoDate(params.paidFrom) }),
    ...(isoDate(params.paidTo) && { paidTo: isoDate(params.paidTo) }),
    sort: oneOf(INVOICE_SORTS, params.sort) ?? 'date',
    direction:
      oneOf<ListSortDirection>(['ascending', 'descending'], params.direction) ??
      'descending'
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

export const invoiceListQueryHref = (query: InvoiceListQuery) =>
  invoiceListHref(
    Object.fromEntries(
      Object.entries(query)
        .filter(
          ([key, value]) =>
            value !== DEFAULT_INVOICE_LIST_QUERY[key as keyof InvoiceListQuery]
        )
        .map(([key, value]) => [key, String(value)])
    )
  );
