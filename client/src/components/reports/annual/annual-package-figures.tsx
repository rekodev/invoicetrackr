import type {
  AnnualPackageSummary,
  TaxEstimateResponse
} from '@invoicetrackr/types';
import { getLocale, getTranslations } from 'next-intl/server';

import InfoPopover from '@/components/ui/info-popover';
import { declarationFigures } from '@/lib/utils/annual-package';
import { formatMoney } from '@/lib/utils/currency';

import CopyAmountButton from './copy-amount-button';

type Props = { summary: AnnualPackageSummary; estimate: TaxEstimateResponse };

const AnnualPackageFigures = async ({ summary, estimate }: Props) => {
  const t = await getTranslations('reports.annual.figures');
  const tMethods = await getTranslations('reports.taxes.methods');
  const locale = await getLocale();

  return (
    <section className="flex flex-col gap-heading">
      <div className="flex items-center gap-field-content">
        <h2 className="text-base font-medium">{t('title')}</h2>
        <InfoPopover title={t('title')}>
          <p>{t('info')}</p>
        </InfoPopover>
      </div>
      <dl className="flex flex-col border-y text-sm">
        {declarationFigures(summary, estimate).map(
          ({ key, amount, copyable, method }) => {
            const label = t(`rows.${key}`, {
              method: method ? tMethods(method) : ''
            });
            const isResult = key === 'profit' || key === 'net';

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-field border-b px-3 py-3 last:border-0"
              >
                <dt className={isResult ? 'font-medium' : 'text-muted'}>
                  {label}
                </dt>
                <dd className="flex items-center gap-field-content">
                  <span
                    className={`text-right tabular-nums ${isResult ? 'font-medium' : ''}`}
                  >
                    {formatMoney(amount, locale)}
                  </span>
                  <span className="flex w-8 justify-center">
                    {copyable && (
                      <CopyAmountButton amount={amount} label={label} />
                    )}
                  </span>
                </dd>
              </div>
            );
          }
        )}
      </dl>
    </section>
  );
};

export default AnnualPackageFigures;
