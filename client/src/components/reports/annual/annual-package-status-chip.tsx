import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Chip } from '@heroui/react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { getAnnualPackage } from '@/api/annual-package';
import InfoPopover from '@/components/ui/info-popover';
import { annualPackageWarningHref } from '@/lib/utils/annual-package';
import { isResponseError } from '@/lib/utils/error';

type Props = { userId: number; year: number };

const AnnualPackageStatusChip = async ({ userId, year }: Props) => {
  const t = await getTranslations('reports.annual');
  const response = await getAnnualPackage(userId, year);

  if (isResponseError(response)) return null;

  const blocking = response.data.warnings.filter(
    ({ severity }) => severity === 'blocking'
  );
  const state = blocking.length ? 'blocking' : 'ready';

  return (
    <InfoPopover
      title={t(`alerts.${state}.title`)}
      trigger={
        <Chip
          size="md"
          variant="soft"
          className="gap-actions"
          color={state === 'blocking' ? 'danger' : 'success'}
        >
          {t(`status.${state}`)}
          <InformationCircleIcon aria-hidden="true" className="size-4" />
        </Chip>
      }
    >
      {state === 'blocking' ? (
        <>
          <p>{t('alerts.blocking.description')}</p>
          <ul className="list-disc space-y-field-content pl-5">
            {blocking.map(({ code, count }) => {
              const href = annualPackageWarningHref(code, year);

              return (
                <li key={code}>
                  {t(`warnings.${code}.text`, { count: count ?? 0, year })}
                  {href && (
                    <>
                      {' '}
                      <Link href={href} className="underline">
                        {t(`warnings.${code}.action`)}
                      </Link>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p>{t('alerts.ready.description', { year })}</p>
      )}
    </InfoPopover>
  );
};

export default AnnualPackageStatusChip;
