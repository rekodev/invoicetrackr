import { Chip } from '@heroui/react';
import { useTranslations } from 'next-intl';

import PreviewToolbar from './preview-toolbar';

export function InvoicesPagePreview() {
  const t = useTranslations('home.product.invoice_table');
  const rows = [
    { key: 'paid', color: 'success' },
    { key: 'pending', color: 'warning' },
    { key: 'canceled', color: 'danger' }
  ] as const;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <PreviewToolbar
        search={t('search')}
        primary={t('add_new')}
        secondary={t('export')}
        total={t('total')}
        rowsPerPage={t('rows_per_page')}
      />
      <div className="bg-background overflow-hidden rounded-3xl border">
        <div className="text-muted grid grid-cols-[1.2fr_1.3fr_1fr_1fr_1fr] gap-3 border-b px-4 py-3 text-[10px] font-medium uppercase tracking-wide">
          <span>{t('columns.id')}</span>
          <span>{t('columns.receiver')}</span>
          <span className="text-right">{t('columns.amount')}</span>
          <span>{t('columns.date')}</span>
          <span>{t('columns.status')}</span>
        </div>
        {rows.map(({ key, color }) => (
          <div
            key={key}
            className="grid grid-cols-[1.2fr_1.3fr_1fr_1fr_1fr] items-center gap-3 border-b px-4 py-3 text-xs last:border-b-0"
          >
            <span className="text-muted font-mono">
              {t(`rows.${key}.id`)}
            </span>
            <span className="truncate font-medium">
              {t(`rows.${key}.client`)}
            </span>
            <span className="text-right font-semibold tabular-nums">
              {t(`rows.${key}.amount`)}
            </span>
            <span className="text-muted">{t(`rows.${key}.date`)}</span>
            <Chip color={color} size="sm" variant="soft" className="w-max">
              {t(`rows.${key}.status`)}
            </Chip>
          </div>
        ))}
      </div>
    </div>
  );
}
