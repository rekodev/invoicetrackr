'use client';

import { Skeleton } from '@heroui/react';

export const DashboardCardSkeleton = () => {
  return (
    <div className="border-default-200 flex min-h-32 flex-col justify-between rounded-xl border p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
      <Skeleton className="mt-5 h-7 w-24 rounded-md" />
    </div>
  );
};

export const DashboardCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <DashboardCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const RevenueChartSkeleton = () => {
  return (
    <div className="border-default-200 flex w-full flex-col rounded-xl border p-5 shadow-sm sm:p-6">
      <Skeleton className="h-5 w-36 rounded-md" />
      <Skeleton className="mt-4 h-[384px] w-full min-w-[656px] rounded-xl" />
    </div>
  );
};

export function InvoiceSkeleton() {
  return (
    <div className="flex min-h-[64px] w-full items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="mt-2 h-3 w-48 rounded-md" />
      </div>
      <Skeleton className="ml-4 h-4 w-16 shrink-0 rounded-md" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div className="border-default-200 w-full min-w-72 rounded-xl border p-5 shadow-sm sm:p-6 xl:max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="mt-2 h-3 w-28 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
      <div className="divide-default-200 mt-4 flex flex-col divide-y">
        {Array.from({ length: 5 }).map((_, index) => (
          <InvoiceSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
