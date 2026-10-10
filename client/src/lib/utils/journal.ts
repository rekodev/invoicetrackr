import type { JournalExportFormat, JournalQuery } from '@invoicetrackr/types';

import {
  JOURNAL_EXPORT_FORMATS,
  JOURNAL_FIRST_YEAR,
  JOURNAL_MIN_YEAR
} from '@/lib/constants/journal';
import { REPORTS_PAGE } from '@/lib/constants/pages';

import { formatMonthYear, todayInLithuania } from './date';

type SearchValue = string | string[] | undefined;

const parseInteger = (value: SearchValue, min: number, max: number) => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return number >= min && number <= max ? number : undefined;
};

export const currentJournalYear = (now?: Date) =>
  Number(todayInLithuania(now).slice(0, 4));

export const parseJournalQuery = (
  searchParams: { year?: SearchValue; month?: SearchValue },
  currentYear = currentJournalYear()
): JournalQuery => ({
  year:
    parseInteger(searchParams.year, JOURNAL_MIN_YEAR, currentYear) ??
    currentYear,
  month: parseInteger(searchParams.month, 1, 12)
});

const journalSearch = ({ year, month }: JournalQuery) =>
  new URLSearchParams({
    year: String(year),
    ...(month ? { month: String(month) } : {})
  });

export const journalHref = (query: JournalQuery) =>
  `${REPORTS_PAGE}?${journalSearch(query)}`;

export const journalExportErrorHref = (query: JournalQuery) =>
  `${journalHref(query)}&export_error=1`;

export const journalExportHref = (
  query: JournalQuery,
  format: JournalExportFormat
) => `${REPORTS_PAGE}/export?${journalSearch(query)}&format=${format}`;

export const journalYears = (currentYear: number, selectedYear: number) => {
  const firstYear = Math.min(JOURNAL_FIRST_YEAR, selectedYear);

  return Array.from(
    { length: currentYear - firstYear + 1 },
    (_, index) => currentYear - index
  );
};

export const isJournalExportFormat = (
  value: string | null
): value is JournalExportFormat =>
  JOURNAL_EXPORT_FORMATS.includes(value as JournalExportFormat);

export const formatJournalPeriod = ({ year, month }: JournalQuery, locale: string) =>
  month ? formatMonthYear(year, month, locale) : String(year);
