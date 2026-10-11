import { Alert, buttonVariants } from '@heroui/react';
import type { AnnualPackageWarning } from '@invoicetrackr/types';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import AttentionReviewMenu from '@/components/dashboard/attention-review-menu';
import { annualPackageWarningHref } from '@/lib/utils/annual-package';

type Severity = AnnualPackageWarning['severity'];

type Props = { warnings: AnnualPackageWarning[]; year: number };

const ALERT_STATUS = { blocking: 'danger', recommendation: 'warning' } as const;

const AnnualPackageWarnings = async ({ warnings, year }: Props) => {
  const t = await getTranslations('reports.annual');

  const renderAlert = (severity: Severity) => {
    const items = warnings.filter((warning) => warning.severity === severity);

    if (!items.length) return null;

    const links = items.flatMap(({ code }) => {
      const href = annualPackageWarningHref(code, year);
      return href ? [{ key: code, action: t(`warnings.${code}.action`), href }] : [];
    });
    const action =
      links.length === 0 ? null : links.length === 1 ? (
        <Link
          href={links[0].href}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {links[0].action}
        </Link>
      ) : (
        <AttentionReviewMenu label={t('review')} items={links} />
      );

    return (
      <Alert key={severity} status={ALERT_STATUS[severity]}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t(`alerts.${severity}.title`)}</Alert.Title>
          <Alert.Description>
            {t(`alerts.${severity}.description`)}
            <ul className="mt-2 list-inside list-disc space-y-1">
              {items.map(({ code, count }) => (
                <li key={code}>
                  {t(`warnings.${code}.text`, { count: count ?? 0, year })}
                </li>
              ))}
            </ul>
          </Alert.Description>
          {action && <div className="mt-2 sm:hidden">{action}</div>}
        </Alert.Content>
        {action && <div className="hidden shrink-0 sm:block">{action}</div>}
      </Alert>
    );
  };

  return (
    <>
      {renderAlert('blocking')}
      {renderAlert('recommendation')}
    </>
  );
};

export default AnnualPackageWarnings;
