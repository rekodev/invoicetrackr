import { Skeleton } from '@heroui/react';

import { BasicCardSkeleton } from './basic-card-skeleton';

export function InvoiceTableSkeleton() {
  return (
    <section className="flex flex-col gap-4 pt-1">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
        <Skeleton className="h-10 w-full rounded-2xl sm:max-w-[44%]" />
        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:gap-3">
          <Skeleton className="h-10 w-full rounded-2xl sm:w-24" />
          <Skeleton className="h-10 w-full rounded-2xl sm:w-28" />
          <Skeleton className="h-10 w-full rounded-2xl sm:w-32" />
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
