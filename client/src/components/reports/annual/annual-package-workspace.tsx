import { getAnnualPackage } from '@/api/annual-package';
import { isResponseError } from '@/lib/utils/error';

import AnnualPackageContents from './annual-package-contents';
import AnnualPackageSummaryCards from './annual-package-summary-cards';
import AnnualPackageWarnings from './annual-package-warnings';

type Props = { userId: number; year: number };

const AnnualPackageWorkspace = async ({ userId, year }: Props) => {
  const response = await getAnnualPackage(userId, year);

  if (isResponseError(response)) {
    throw new Error('Failed to fetch annual package');
  }

  const { asOf, isComplete, summary, warnings } = response.data;

  return (
    <div className="flex flex-col gap-6">
      <AnnualPackageWarnings warnings={warnings} year={year} />
      <AnnualPackageSummaryCards summary={summary} year={year} />
      <AnnualPackageContents year={year} asOf={asOf} isComplete={isComplete} />
    </div>
  );
};

export default AnnualPackageWorkspace;
