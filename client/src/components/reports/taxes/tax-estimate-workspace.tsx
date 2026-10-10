import { getTranslations } from 'next-intl/server';

import { getTaxEstimate } from '@/api/tax';
import EmptyState from '@/components/empty-state';
import { isResponseError } from '@/lib/utils/error';

import TaxAssumptionsCard from './tax-assumptions-card';
import TaxEstimateDisclaimer from './tax-estimate-disclaimer';
import TaxMethodComparison from './tax-method-comparison';
import TaxSetupPrompt from './tax-setup-prompt';

type Props = { userId: number; year: number };

const TaxEstimateWorkspace = async ({ userId, year }: Props) => {
  const t = await getTranslations('reports.taxes');
  const response = await getTaxEstimate(userId, year);

  if (isResponseError(response)) throw new Error('Failed to fetch tax estimate');

  const estimate = response.data;

  if (estimate.status === 'unsupported_year') {
    return (
      <EmptyState
        className="rounded-3xl border"
        title={t('unsupported.title', { year })}
        description={t('unsupported.description', {
          years: estimate.supportedYears.join(', ')
        })}
      />
    );
  }

  if (estimate.status === 'needs_profile') {
    return <TaxSetupPrompt userId={userId} year={year} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <TaxAssumptionsCard
        userId={userId}
        year={year}
        profile={estimate.profile}
        activeMonths={estimate.activeMonths}
      />
      <TaxMethodComparison
        methods={[estimate.methods.thirtyPercent, estimate.methods.actual]}
        selectedMethod={estimate.profile.expenseMethod}
        lowerMethod={estimate.lowerMethod}
      />
      <TaxEstimateDisclaimer rules={estimate.rules} />
    </div>
  );
};

export default TaxEstimateWorkspace;
