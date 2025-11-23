'use client';

import { Skeleton } from '@heroui/react';

export function InvoiceTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-10 w-full max-w-[542px] rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="hidden h-10 w-[100px] rounded-xl sm:visible" />
            <Skeleton className="hidden h-10 w-[114px] rounded-xl sm:visible" />
            <Skeleton className="h-10 w-[116px] rounded-xl" />
          </div>
        </div>

        <div className="flex justify-between">
          <Skeleton className="h-5 w-[100px] rounded-xl" />
          <Skeleton className="h-5 w-[136px] rounded-xl" />
        </div>
      </div>
      <Skeleton className="min-h-[480px] rounded-xl" />
      <div className="relative mt-2 flex items-center justify-center">
        <Skeleton className="h-9 w-[108px] rounded-xl" />
        <div className="absolute right-0 hidden gap-2 sm:flex">
          <Skeleton className="h-8 w-[72px] rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
