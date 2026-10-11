import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { buttonVariants, Card, Chip } from '@heroui/react';
import { getLocale, getTranslations } from 'next-intl/server';

import { ANNUAL_PACKAGE_SHEETS } from '@/lib/constants/annual-package';
import { annualPackageExportHref } from '@/lib/utils/annual-package';
import { formatLocalizedDate } from '@/lib/utils/date';

type Props = { year: number; asOf: string; isComplete: boolean };

const AnnualPackageContents = async ({ year, asOf, isComplete }: Props) => {
  const t = await getTranslations('reports.annual.contents');
  const locale = await getLocale();

  return (
    <Card className="border">
      <Card.Header className="flex-row flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium">{t('title', { year })}</h2>
            <Chip
              size="sm"
              variant="soft"
              color={isComplete ? 'success' : 'danger'}
            >
              {t(isComplete ? 'complete' : 'incomplete')}
            </Chip>
          </div>
          <p className="text-muted text-sm">
            {t('subtitle', { date: formatLocalizedDate(asOf, locale) ?? asOf })}
          </p>
        </div>
        <a
          href={annualPackageExportHref(year)}
          className={buttonVariants({ size: 'sm' })}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {t('download')}
        </a>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {ANNUAL_PACKAGE_SHEETS.map((sheet) => (
            <div key={sheet}>
              <dt className="text-muted text-xs font-medium">
                {t(`sheets.${sheet}.name`)}
              </dt>
              <dd className="text-sm">{t(`sheets.${sheet}.description`)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-muted text-sm">{t('disclaimer')}</p>
      </Card.Content>
    </Card>
  );
};

export default AnnualPackageContents;
