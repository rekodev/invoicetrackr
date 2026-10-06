import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from '@/lib/constants/expense';
import { EXPENSES_PAGE } from '@/lib/constants/pages';
import type { SortDescriptor } from '@/lib/types/table';

const SORT_COLUMNS = ['expenseDate', 'supplier', 'description', 'category', 'totalAmount', 'deductibleAmount', 'paymentMethod'];

export const readExpenseListState = (params: URLSearchParams) => {
  const positiveInteger = (key: string, fallback: number) => {
    const value = Number(params.get(key));
    return Number.isSafeInteger(value) && value > 0 ? value : fallback;
  };
  const category = params.get('category') ?? '';
  const method = params.get('method') ?? '';
  const date = (key: string) => {
    const value = params.get(key) ?? '';
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : '';
  };
  const pageSize = positiveInteger('pageSize', 10);
  return {
    filterValue: params.get('q') ?? '',
    categoryFilter: EXPENSE_CATEGORIES.some((item) => item === category) ? category : 'all',
    paymentMethodFilter: EXPENSE_PAYMENT_METHODS.some((item) => item === method) ? method : 'all',
    hasAttachmentFilter: params.get('documents') === '1',
    dateFrom: date('from'),
    dateTo: date('to'),
    page: positiveInteger('page', 1),
    rowsPerPage: [5, 10, 15].includes(pageSize) ? pageSize : 10,
    sortDescriptor: {
      column: SORT_COLUMNS.includes(params.get('sort') ?? '') ? params.get('sort')! : 'expenseDate',
      direction: params.get('direction') === 'ascending' ? 'ascending' : 'descending'
    } as SortDescriptor
  };
};

export const expenseListHref = (params: URLSearchParams) => {
  const query = params.toString();
  return `${EXPENSES_PAGE}${query ? `?${query}` : ''}`;
};

export const safeExpenseReturnTo = (value?: string | string[]) => {
  if (typeof value !== 'string' || /[\\\r\n]/.test(value)) return EXPENSES_PAGE;
  try {
    const url = new URL(value, 'https://invoicetrackr.local');
    if (url.origin !== 'https://invoicetrackr.local' || url.pathname !== EXPENSES_PAGE) return EXPENSES_PAGE;
    return expenseListHref(url.searchParams);
  } catch {
    return EXPENSES_PAGE;
  }
};
