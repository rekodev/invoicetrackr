import { Card, Chip, buttonVariants } from '@heroui/react';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

export default function LatestInvoicesPanelPreview() {
  const t = useTranslations('home.preview.dashboard.latest');
  const rows = [
    { key: 'paid', color: 'success' },
    { key: 'pending', color: 'warning' },
    { key: 'overdue', color: 'danger' }
  ] as const;

  return (
    <Card variant="secondary" className="w-full min-w-0 border">
      <Card.Header className="items-start justify-between gap-4">
        <div>
          <Card.Title className="text-base font-semibold">
            {t('title')}
          </Card.Title>
          <Card.Description className="mt-1">{t('subtitle')}</Card.Description>
        </div>
        <span
          className={buttonVariants({
            size: 'sm',
            variant: 'outline',
            className: 'gap-1'
          })}
        >
          {t('view_all')}
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </span>
      </Card.Header>

      <Card.Content>
        <ul className="divide-default-200 divide-y">
          {rows.map(({ key, color }) => (
            <li
              key={key}
              className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {t(`rows.${key}.client`)}
                  </span>
                  <Chip
                    size="sm"
                    color={color}
                    variant="soft"
                    className="h-5 shrink-0 text-[11px] font-medium"
                  >
                    {t(`rows.${key}.status`)}
                  </Chip>
                </div>
                <div className="text-muted mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px]">
                  <span className="shrink-0 tabular-nums">
                    {t(`rows.${key}.id`)}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{t(`rows.${key}.date`)}</span>
                </div>
              </div>
              <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
                {t(`rows.${key}.amount`)}
              </div>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}
