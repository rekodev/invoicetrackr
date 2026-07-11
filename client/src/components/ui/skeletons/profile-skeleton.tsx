'use client';

import { Skeleton } from '@heroui/react';

export default function ProfileSkeleton() {
  return (
    <div className="border-default-200 bg-surface flex w-full flex-col overflow-hidden rounded-xl border">
      <div className="px-6 py-5">
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>
      <div className="border-default-200 border-t" />
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <Skeleton className="h-16 w-full rounded-xl md:col-span-2" />
        <div className="border-default-200 flex items-center justify-between gap-4 rounded-xl border p-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="border-default-200 flex justify-end border-t px-6 py-4">
        <Skeleton className="h-10 w-full rounded-lg sm:w-36" />
      </div>
    </div>
  );
}
