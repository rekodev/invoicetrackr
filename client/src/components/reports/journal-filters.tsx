'use client';

import { Label, ListBox, ListBoxItem, Select } from '@heroui/react';
import type { JournalQuery } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { formatMonthName } from '@/lib/utils/date';
import { journalHref, journalYears } from '@/lib/utils/journal';

import YearSelect from './year-select';

type Props = { query: JournalQuery; currentYear: number };

const ALL_MONTHS = 'all';

const JournalFilters = ({ query, currentYear }: Props) => {
  const t = useTranslations('reports.journal.filters');
  const locale = useLocale();
  const router = useRouter();
  const months = Array.from({ length: 12 }, (_, index) => ({
    id: String(index + 1),
    name: formatMonthName(query.year, index + 1, locale)
  }));

  const navigate = (next: JournalQuery) => router.push(journalHref(next));

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex">
      <YearSelect
        label={t('year')}
        year={query.year}
        years={journalYears(currentYear, query.year)}
        onChange={(year) => navigate({ year, month: query.month })}
      />
      <Select
        className="sm:w-44"
        variant="secondary"
        value={query.month ? String(query.month) : ALL_MONTHS}
        onChange={(value) =>
          navigate({
            year: query.year,
            month: value === ALL_MONTHS ? undefined : Number(value)
          })
        }
      >
        <Label>{t('month')}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {[{ id: ALL_MONTHS, name: t('all_months') }, ...months].map(
              (month) => (
                <ListBoxItem
                  key={month.id}
                  id={month.id}
                  textValue={month.name}
                  className="capitalize"
                >
                  {month.name}
                  <ListBoxItem.Indicator />
                </ListBoxItem>
              )
            )}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
};

export default JournalFilters;
