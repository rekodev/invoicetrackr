import { Alert, buttonVariants } from '@heroui/react';
import type { DashboardAttention } from '@invoicetrackr/types';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { FREELANCER_PROFILE_PAGE } from '@/lib/constants/pages';
import { dashboardLinks, yearRange } from '@/lib/utils/dashboard';

import AttentionReviewMenu from './attention-review-menu';

type Props = {
  attention: DashboardAttention;
  year: number;
  isEmailVerified: boolean;
};

const AttentionStrip = async ({ attention, year, isEmailVerified }: Props) => {
  const t = await getTranslations('dashboard.attention');
  const items = [
    attention.draftCount > 0 && {
      key: 'drafts',
      text: t('drafts', { count: attention.draftCount }),
      action: t('actions.drafts'),
      href: dashboardLinks.drafts()
    },
    attention.overdueWithoutEmail > 0 && {
      key: 'overdue_without_email',
      text: t('overdue_without_email', { count: attention.overdueWithoutEmail }),
      action: t('actions.overdue_without_email'),
      href: dashboardLinks.overdue()
    },
    attention.expensesMissingDocuments > 0 && {
      key: 'expenses_missing_documents',
      text: t('expenses_missing_documents', {
        count: attention.expensesMissingDocuments
      }),
      action: t('actions.expenses_missing_documents'),
      href: dashboardLinks.expensesMissingDocuments(yearRange(year))
    },
    !isEmailVerified && {
      key: 'email_unverified',
      text: t('email_unverified'),
      action: t('actions.email_unverified'),
      href: FREELANCER_PROFILE_PAGE
    }
  ].filter((item) => item !== false);

  if (!items.length) return null;

  const action =
    items.length === 1 ? (
      <Link
        href={items[0].href}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {items[0].action}
      </Link>
    ) : (
      <AttentionReviewMenu label={t('review')} items={items} />
    );

  return (
    <Alert status="warning">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('title')}</Alert.Title>
        <Alert.Description>
          {t('description')}
          <ul className="mt-2 list-inside list-disc space-y-1">
            {items.map((item) => (
              <li key={item.key}>{item.text}</li>
            ))}
          </ul>
        </Alert.Description>
        <div className="mt-2 sm:hidden">{action}</div>
      </Alert.Content>
      <div className="hidden shrink-0 sm:block">{action}</div>
    </Alert>
  );
};

export default AttentionStrip;
