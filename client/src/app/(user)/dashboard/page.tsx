import { Suspense } from 'react';

import { auth } from '@/auth';
import MoneyWorkbench from '@/components/dashboard/money-workbench';
import { MoneyWorkbenchSkeleton } from '@/components/ui/skeletons/dashboard-skeleton';

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <main className="flex flex-col gap-5">
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
