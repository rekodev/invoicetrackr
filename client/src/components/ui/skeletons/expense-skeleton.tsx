'use client';

import { Skeleton } from '@heroui/react';

const ExpenseMetricCardSkeleton = () => (
  <Skeleton className="min-h-[122px] rounded-3xl">
    <div className="flex min-h-[122px] flex-col justify-between p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-4 w-36 rounded-xl" />
      </div>
      <Skeleton className="mt-5 h-7 w-28 rounded-xl" />
    </div>
  </Skeleton>
);

export function ExpenseTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ExpenseMetricCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-4 pt-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-36" />
          </div>

          <div className="flex justify-start">
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto">
              <Skeleton className="hidden h-10 w-4 rounded-md lg:flex" />
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:flex">
                <Skeleton className="h-10 rounded-xl lg:w-28" />
                <Skeleton className="h-10 rounded-xl lg:w-28" />
              </div>
              <Skeleton className="h-10 rounded-xl lg:w-36" />
              <Skeleton className="h-10 rounded-xl lg:w-44" />
              <Skeleton className="h-10 rounded-xl lg:w-36" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-xl" />
          <Skeleton className="h-5 w-36 rounded-xl" />
        </div>
      </div>

      <Skeleton className="min-h-[480px] rounded-3xl" />

      <div className="relative mt-2 flex items-center justify-center">
        <Skeleton className="h-9 w-[108px] rounded-xl" />
        <div className="absolute right-0 hidden gap-2 sm:flex">
          <Skeleton className="h-8 w-[72px] rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
