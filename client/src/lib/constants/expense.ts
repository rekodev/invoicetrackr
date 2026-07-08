import type {
  ExpenseCategory,
  ExpensePaymentMethod
} from '@invoicetrackr/types';

export const EXPENSE_CATEGORIES: Array<ExpenseCategory> = [
  'software',
  'equipment',
  'telecommunications',
  'office',
  'travel',
  'transport',
  'professional_services',
  'marketing',
  'education',
  'bank_fees',
  'insurance',
  'other'
];

export const EXPENSE_PAYMENT_METHODS: Array<ExpensePaymentMethod> = [
  'bank_transfer',
  'card',
  'cash',
  'other'
];
