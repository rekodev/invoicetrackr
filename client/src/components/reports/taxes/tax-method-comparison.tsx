import { ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Card, Chip } from '@heroui/react';
import type {
  TaxExpenseMethod,
  TaxMethodEstimate
} from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { formatMoney } from '@/lib/utils/currency';
import { subtractMoney } from '@/lib/utils/dashboard';

type Props = {
  methods: TaxMethodEstimate[];
  selectedMethod: TaxExpenseMethod;
  lowerMethod: TaxExpenseMethod | null;
  info: ReactNode;
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
  lowerMethod,
  info
}: Props) => {
  const t = await getTranslations('reports.taxes.comparison');
  const tMethods = await getTranslations('reports.taxes.methods');
  const locale = await getLocale();
  const money = (amount: string) => formatMoney(amount, locale);
  const lowerBy = (estimate: TaxMethodEstimate) => {
    const other = methods.find(({ method }) => method !== estimate.method);
    return estimate.method === lowerMethod && other
      ? t('lower_by', {
          amount: money(subtractMoney(other.total, estimate.total)),
          method: tMethods(other.method)
        })
      : null;
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <h2 className="text-base font-medium">{t('title')}</h2>
        {info}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {methods.map((estimate) => (
          <Card key={estimate.method} className="border">
            <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-medium">{tMethods(estimate.method)}</h3>
              {estimate.method === selectedMethod && (
                <Chip variant="soft" color="accent">{t('your_method')}</Chip>
              )}
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
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                    {t('rows.total')}
                    {lowerBy(estimate) && (
                      <span className="text-success flex items-center gap-1 text-xs font-normal">
                        <ArrowTrendingDownIcon aria-hidden="true" className="size-3.5" />
                        {lowerBy(estimate)}
                      </span>
                    )}
                  </p>
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
