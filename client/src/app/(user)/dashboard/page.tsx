import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import MoneyWorkbench from '@/components/dashboard/money-workbench';
import PageHeader from '@/components/ui/page-header';
import { MoneyWorkbenchSkeleton } from '@/components/ui/skeletons/dashboard-skeleton';

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const t = await getTranslations('breadcrumbs');

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={t('dashboard')} />
      <Suspense fallback={<MoneyWorkbenchSkeleton />}>
        <MoneyWorkbench
          userId={Number(session.user.id)}
          isEmailVerified={Boolean(session.user.emailVerifiedAt)}
        />
      </Suspense>
    </main>
  );
};

export default DashboardPage;
