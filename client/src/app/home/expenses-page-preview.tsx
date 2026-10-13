import { PaperClipIcon } from '@heroicons/react/24/outline';
import { Card, Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';

const rows = [
  { key: 'software', hasDocument: true },
  { key: 'equipment', hasDocument: true },
  { key: 'telecom', hasDocument: false }
] as const;

export default function ExpensesPagePreview() {
  const t = useTranslations('home.product.expenses_preview');

  return (
    <Card variant="secondary" className="mt-6 overflow-hidden border p-0">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <span className="section-eyebrow text-muted min-w-0">{t('total')}</span>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums">
          {t('total_value')}
        </span>
      </div>
      {rows.map(({ key, hasDocument }) => (
        <div
          key={key}
          className="flex items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {t(`rows.${key}.supplier`)}
            </div>
            <div className="text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
              <span className="truncate">{t(`rows.${key}.category`)}</span>
              {hasDocument ? (
                <span className="inline-flex items-center gap-1 font-mono">
                  <PaperClipIcon className="h-3 w-3" />
                  {t(`rows.${key}.document`)}
                </span>
              ) : (
                <Chip size="sm" color="warning" variant="soft">
                  {t('missing_document')}
                </Chip>
              )}
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap text-right font-semibold tabular-nums">
            {t(`rows.${key}.amount`)}
          </span>
        </div>
      ))}
    </Card>
  );
}
