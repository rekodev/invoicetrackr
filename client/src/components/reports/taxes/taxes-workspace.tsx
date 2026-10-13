import { getTranslations } from 'next-intl/server';

import { getAnnualPackage } from '@/api/annual-package';
import EmptyState from '@/components/empty-state';
import AnnualPackageChecks from '@/components/reports/annual/annual-package-checks';
import AnnualPackageFigures from '@/components/reports/annual/annual-package-figures';
import { isResponseError } from '@/lib/utils/error';

import TaxAssumptionsCard from './tax-assumptions-card';
import TaxEstimateDisclaimer from './tax-estimate-disclaimer';
import TaxMethodComparison from './tax-method-comparison';
import TaxSetupPrompt from './tax-setup-prompt';

type Props = { userId: number; year: number };

const TaxesWorkspace = async ({ userId, year }: Props) => {
  const t = await getTranslations('reports.taxes');
  const response = await getAnnualPackage(userId, year);

  if (isResponseError(response)) throw new Error('Failed to fetch taxes');

  const { summary, warnings, estimate } = response.data;

  return (
    <div className="flex flex-col gap-section">
      <AnnualPackageChecks warnings={warnings} year={year} />
      {estimate.status === 'ready' && (
        <TaxAssumptionsCard
          userId={userId}
          year={year}
          profile={estimate.profile}
          activeMonths={estimate.activeMonths}
        />
      )}
      {estimate.status === 'needs_profile' && (
        <TaxSetupPrompt userId={userId} year={year} />
      )}
      <AnnualPackageFigures summary={summary} estimate={estimate} />
      {estimate.status === 'unsupported_year' && (
        <EmptyState
          className="rounded-3xl border"
          title={t('unsupported.title', { year })}
          description={t('unsupported.description', {
            years: estimate.supportedYears.join(', ')
          })}
        />
      )}
      {estimate.status === 'ready' && (
        <TaxMethodComparison
          methods={[estimate.methods.thirtyPercent, estimate.methods.actual]}
          selectedMethod={estimate.profile.expenseMethod}
          lowerMethod={estimate.lowerMethod}
          info={<TaxEstimateDisclaimer rules={estimate.rules} />}
        />
      )}
    </div>
  );
};

export default TaxesWorkspace;
