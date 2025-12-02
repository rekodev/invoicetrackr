import { ReactNode, Suspense } from 'react';

import UserNavCardSkeleton from '@/components/ui/skeletons/user-nav-card-skeleton';
import UserNavCardWrapper from '@/components/profile/user-nav-card-wrapper';

export default async function ProfilePageLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 sm:flex-row">
      <Suspense fallback={<UserNavCardSkeleton />}>
        <UserNavCardWrapper />
      </Suspense>
      {children}
    </section>
  );
}
