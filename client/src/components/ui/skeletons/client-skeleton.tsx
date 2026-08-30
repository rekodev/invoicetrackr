import { Skeleton } from '@heroui/react';

import { BasicCardGridSkeleton } from './basic-card-skeleton';

export function ClientSectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
          <Skeleton className="h-10 w-full rounded-2xl sm:max-w-[44%]" />
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:gap-3">
            <Skeleton className="h-10 w-full rounded-2xl sm:w-28" />
            <Skeleton className="h-10 w-full rounded-2xl sm:w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-28 rounded-lg" />
      </div>
      <BasicCardGridSkeleton
        count={6}
        className="xl:grid-cols-3"
        cardClassName="min-h-[182px]"
      />
    </section>
  );
}
