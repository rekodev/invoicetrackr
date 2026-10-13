import { WalletIcon } from '@heroicons/react/24/outline';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

import IconContainer from '@/components/ui/icon-container';

const rows = ['received_income', 'expenses', 'tax_reserve'] as const;

export default function TaxReservePreview() {
  const t = useTranslations('home.product.tax_preview');

  return (
    <Card variant="secondary" className="mt-6 border">
      <Card.Content className="flex flex-col gap-4">
        <div className="text-muted flex items-center gap-2 text-sm font-medium">
          <IconContainer size="sm" variant="success">
            <WalletIcon className="h-4 w-4" />
          </IconContainer>
          {t('title')}
        </div>
        <dl className="flex flex-col text-sm">
          {rows.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 border-b py-2.5"
            >
              <dt className="text-muted">{t(`rows.${key}.label`)}</dt>
              <dd className="tabular-nums">{t(`rows.${key}.value`)}</dd>
            </div>
          ))}
          <div className="bg-default mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 font-semibold">
            <dt>{t('rows.safe_to_spend.label')}</dt>
            <dd className="tabular-nums">{t('rows.safe_to_spend.value')}</dd>
          </div>
        </dl>
      </Card.Content>
    </Card>
  );
}
