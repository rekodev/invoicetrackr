import { describe, expect, it } from 'vitest';

import {
  currentJournalYear,
  formatJournalPeriod,
  isJournalExportFormat,
  journalExportHref,
  journalHref,
  journalYears,
  parseJournalQuery
} from '../journal';

describe('journal utils', () => {
  it.each([
    [{}, { year: 2026, month: undefined }],
    [{ year: '2025', month: '3' }, { year: 2025, month: 3 }],
    [{ year: '2027', month: '13' }, { year: 2026, month: undefined }],
    [{ year: '2001', month: '0' }, { year: 2001, month: undefined }],
    [{ year: '1999' }, { year: 2026, month: undefined }],
    [{ year: ['2025'], month: '1e1' }, { year: 2026, month: undefined }]
  ])('parses %j into a safe journal query', (searchParams, expected) => {
    expect(parseJournalQuery(searchParams, 2026)).toEqual(expected);
  });

  it('builds page and export links, year options, and period labels', () => {
    expect(currentJournalYear(new Date('2026-12-31T23:30:00Z'))).toBe(2027);
    expect(journalHref({ year: 2026 })).toBe('/reports?year=2026');
    expect(journalHref({ year: 2026, month: 3 })).toBe('/reports?year=2026&month=3');
    expect(journalExportHref({ year: 2026, month: 3 }, 'xlsx')).toBe(
      '/reports/export?year=2026&month=3&format=xlsx'
    );
    expect(journalYears(2022, 2022)).toEqual([2022, 2021, 2020]);
    expect(journalYears(2021, 2018)).toEqual([2021, 2020, 2019, 2018]);
    expect(formatJournalPeriod({ year: 2026 }, 'en')).toBe('2026');
    expect(formatJournalPeriod({ year: 2026, month: 3 }, 'en')).toBe('March 2026');
    expect(isJournalExportFormat('csv')).toBe(true);
    expect(isJournalExportFormat('pdf')).toBe(false);
    expect(isJournalExportFormat(null)).toBe(false);
  });
});
