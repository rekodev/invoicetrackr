import { Skeleton } from '@heroui/react';

import { BasicCardSkeleton } from './basic-card-skeleton';

export function InvoiceTableSkeleton() {
  return (
    <section className="flex flex-col gap-field">
      <div className="flex flex-col items-stretch justify-between gap-heading sm:flex-row sm:items-end">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <div className="grid w-full grid-cols-1 gap-actions sm:flex sm:w-auto sm:gap-heading">
          <Skeleton className="h-10 w-full rounded-2xl sm:w-24" />
          <Skeleton className="h-10 w-full rounded-2xl sm:w-28" />
          <Skeleton className="h-10 w-full rounded-2xl sm:w-28" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-4 w-28 rounded-lg" />
      </div>
      <BasicCardSkeleton className="min-h-[480px]" />
    </section>
  );
}
