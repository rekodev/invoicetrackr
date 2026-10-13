import { Skeleton } from '@heroui/react';

import { BasicCardGridSkeleton, BasicCardSkeleton } from './basic-card-skeleton';

export function ClientWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-section">
      <BasicCardGridSkeleton
        count={3}
        className="gap-section sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3"
        cardClassName="min-h-[122px]"
      />
      <BasicCardSkeleton className="min-h-[220px]" />
      <BasicCardSkeleton className="min-h-[320px]" />
    </div>
  );
}

export function ClientSectionSkeleton() {
  return (
    <section className="flex flex-col gap-section">
      <div className="flex flex-col gap-field">
        <div className="flex flex-col items-stretch justify-between gap-heading sm:flex-row sm:items-end">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <div className="grid w-full grid-cols-1 gap-actions sm:flex sm:w-auto sm:gap-heading">
            <Skeleton className="h-10 w-full rounded-2xl sm:w-28" />
          </div>
        </div>
        <Skeleton className="h-4 w-28 rounded-lg" />
      </div>
      <BasicCardGridSkeleton
        count={6}
        className="gap-section xl:grid-cols-3"
        cardClassName="min-h-[182px]"
      />
    </section>
  );
}
