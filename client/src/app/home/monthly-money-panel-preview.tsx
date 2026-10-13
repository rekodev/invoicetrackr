import { Card } from '@heroui/react';
import { useFormatter, useTranslations } from 'next-intl';

const months = [
  { income: 38, expenses: 12 },
  { income: 64, expenses: 18 },
  { income: 44, expenses: 9 },
  { income: 78, expenses: 22 },
  { income: 56, expenses: 14 },
  { income: 86, expenses: 30 },
  { income: 72, expenses: 16 },
  { income: 93, expenses: 20 },
  { income: 68, expenses: 11 },
  { income: 82, expenses: 24 },
  { income: 58, expenses: 15 },
  { income: 74, expenses: 19 }
];

export default function MonthlyMoneyPanelPreview() {
  const t = useTranslations('home.preview.dashboard.monthly');
  const format = useFormatter();

  return (
    <Card variant="secondary" className="min-h-72 border">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-3">
        <Card.Title className="text-base font-semibold">
          {t('title')}
        </Card.Title>
        <div className="text-muted flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="bg-accent h-2 w-3 rounded-sm" />
            {t('income')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-warning h-2 w-3 rounded-sm" />
            {t('expenses')}
          </span>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="grid min-h-48 grid-cols-12 gap-1.5 border-b border-l px-3 pb-3 sm:gap-2">
          {months.map(({ income, expenses }, index) => (
            <div key={index} className="flex items-end gap-0.5">
              <div
                className="bg-accent flex-1 rounded-t-md"
                style={{ height: `${income}%` }}
              />
              <div
                className="bg-warning flex-1 rounded-t-md"
                style={{ height: `${expenses}%` }}
              />
            </div>
          ))}
        </div>
        <div className="text-muted mt-3 grid grid-cols-12 gap-1.5 px-3 text-center text-[10px] sm:gap-2">
          {months.map((_, index) => (
            <span key={index} className="truncate">
              {format.dateTime(new Date(2026, index, 1), { month: 'narrow' })}
            </span>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
