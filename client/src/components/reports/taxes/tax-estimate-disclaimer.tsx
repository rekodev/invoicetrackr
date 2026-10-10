import { Alert } from '@heroui/react';
import type { TaxRulesSummary } from '@invoicetrackr/types';
import { getTranslations } from 'next-intl/server';

type Props = { rules: TaxRulesSummary };

const TaxEstimateDisclaimer = async ({ rules }: Props) => {
  const t = await getTranslations('reports.taxes.disclaimer');

  return (
    <Alert status="accent">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('title')}</Alert.Title>
        <Alert.Description>
          {t('description', { version: rules.version })}
          <span className="mt-1 block">{t('not_covered')}</span>
          <span className="mt-2 block font-medium">{t('sources')}</span>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {rules.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer" className="underline">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
};

export default TaxEstimateDisclaimer;
