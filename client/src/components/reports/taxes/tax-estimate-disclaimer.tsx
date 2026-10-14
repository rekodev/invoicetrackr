import type { TaxRulesSummary } from '@invoicetrackr/types';
import { getTranslations } from 'next-intl/server';

import InfoPopover from '@/components/ui/info-popover';

type Props = { rules: TaxRulesSummary };

const TaxEstimateDisclaimer = async ({ rules }: Props) => {
  const t = await getTranslations('reports.taxes');

  return (
    <InfoPopover title={t('disclaimer.title')}>
      <p className="text-muted">{t('comparison.subtitle')}</p>
      <p>{t('disclaimer.description', { version: rules.version })}</p>
      <p>{t('disclaimer.not_covered')}</p>
      <p className="font-medium">{t('disclaimer.sources')}</p>
      <ul className="list-disc space-y-field-content pl-5">
        {rules.sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </InfoPopover>
  );
};

export default TaxEstimateDisclaimer;
