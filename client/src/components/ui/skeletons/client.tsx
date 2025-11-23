'use client';

import { Skeleton } from '@heroui/react';

export function ClientSectionSkeleton() {
  const renderClientCard = (key: number) => {
    return <Skeleton key={key} className="h-[104px] w-full rounded-xl" />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-10 w-full max-w-[542px] rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="hidden h-10 w-24 rounded-xl sm:flex" />
            <Skeleton className="h-10 w-[116px] rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-5 w-[100px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => renderClientCard(index))}
      </div>

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
