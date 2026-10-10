import type { JournalExportFormat } from '@invoicetrackr/types';

export const JOURNAL_MIN_YEAR = 2000;
export const JOURNAL_FIRST_YEAR = 2020;

export const JOURNAL_EXPORT_FORMATS: JournalExportFormat[] = ['csv', 'xlsx'];

export const JOURNAL_GUIDE_ITEMS = [
  'income',
  'vat',
  'expenses',
  'declaration',
  'formats',
  'sources'
] as const;
