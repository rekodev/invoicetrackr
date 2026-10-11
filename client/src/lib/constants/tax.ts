import type { TaxExpenseMethod } from '@invoicetrackr/types';

// Mirrors the years in the server's TAX_RULES.
export const TAX_SUPPORTED_YEARS = [2026];

export const TAX_EXPENSE_METHODS: TaxExpenseMethod[] = [
  'thirty_percent',
  'actual'
];
