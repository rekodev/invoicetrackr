import type { TaxRulesSummary } from '@invoicetrackr/types';
import { getTranslations } from 'next-intl/server';

import InfoPopover from '@/components/ui/info-popover';

type Props = { rules: TaxRulesSummary };

const TaxEstimateDisclaimer = async ({ rules }: Props) => {
  const t = await getTranslations('reports.taxes');

  return (
    <InfoPopover title={t('disclaimer.title')}>
      <p className="text-muted">{t('comparison.subtitle')}</p>
      <p className="text-muted">
        {t('disclaimer.description', { version: rules.version })}
      </p>
      <p className="text-muted">{t('disclaimer.not_covered')}</p>
      <p className="font-medium">{t('disclaimer.sources')}</p>
      <ul className="text-muted list-disc space-y-1 pl-5">
        {rules.sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground underline"
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
