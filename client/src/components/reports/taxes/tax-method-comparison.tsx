import { Card, Chip } from '@heroui/react';
import type {
  TaxExpenseMethod,
  TaxMethodEstimate
} from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatMoney } from '@/lib/utils/currency';

type Props = {
  methods: TaxMethodEstimate[];
  selectedMethod: TaxExpenseMethod;
  lowerMethod: TaxExpenseMethod | null;
};

const ROWS = [
  { key: 'income', field: 'income' },
  { key: 'deductions', field: 'deductions' },
  { key: 'contribution_base', field: 'contributionBase' },
  { key: 'vsd', field: 'vsd' },
  { key: 'psd', field: 'psd' },
  { key: 'gpm_profit', field: 'gpmProfit' },
  { key: 'gpm_before_credit', field: 'gpmBeforeCredit' },
  { key: 'gpm_credit', field: 'gpmCredit' },
  { key: 'gpm', field: 'gpm' }
] as const;

const TaxMethodComparison = async ({
  methods,
  selectedMethod,
  lowerMethod
}: Props) => {
  const t = await getTranslations('reports.taxes.comparison');
  const tMethods = await getTranslations('reports.taxes.methods');
  const locale = await getLocale();
  const money = (amount: string) => formatMoney(amount, locale);

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-medium">{t('title')}</h2>
        <p className="text-muted text-sm">{t('subtitle')}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {methods.map((estimate) => (
          <Card key={estimate.method} className="border">
            <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-medium">{tMethods(estimate.method)}</h3>
              <div className="flex flex-wrap gap-2">
                {estimate.method === selectedMethod && (
                  <Chip variant="soft" color="accent">{t('your_method')}</Chip>
                )}
                {estimate.method === lowerMethod && (
                  <Chip variant="soft" color="success">{t('lower')}</Chip>
                )}
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <dl className="flex flex-col text-sm">
                {ROWS.map(({ key, field }) => (
                  <div key={key} className="flex justify-between gap-4 border-b py-1.5 last:border-0">
                    <dt className="text-muted">
                      {t(`rows.${key}`)}
                      {key === 'psd' && estimate.psdMinimumApplied && (
                        <span className="block text-xs">{t('rows.psd_minimum')}</span>
                      )}
                      {key === 'gpm' && estimate.usesCombinedIncomeBands && (
                        <span className="block text-xs">{t('rows.combined_bands')}</span>
                      )}
                    </dt>
                    <dd className="text-right tabular-nums">{money(estimate[field])}</dd>
                  </div>
                ))}
              </dl>
              <div className="bg-default flex items-end justify-between gap-4 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{t('rows.total')}</p>
                  <p className="text-muted text-xs">
                    {t('rows.effective_rate', { rate: estimate.effectiveRate })}
                  </p>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{money(estimate.total)}</p>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TaxMethodComparison;
