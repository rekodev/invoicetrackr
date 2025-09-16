'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export const DashboardCardSkeleton = () => {
  return (
    <Card
      className={`${shimmer} border-default-200 bg-default-100 relative flex flex-col gap-4 overflow-hidden rounded-xl border p-2 shadow-sm`}
    >
      <CardHeader className="px-1">
        <div className="flex gap-1">
          <div className="bg-default-500 h-5 w-5 rounded-md" />
          <div className="bg-default-500 h-5 w-16 rounded-md text-sm font-medium" />
        </div>
      </CardHeader>
      <CardBody className="p-1">
        <div className="bg-default-200 flex items-center justify-center truncate rounded-xl px-4 py-6">
          <div className="bg-default-500 h-7 w-20 rounded-md" />
        </div>
      </CardBody>
    </Card>
  );
};

export const DashboardCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </div>
  );
};

export const RevenueChartSkeleton = () => {
  return (
    <div className="flex h-[110rem] w-full flex-col gap-3 overflow-hidden">
      <div className="bg-default-500 mb-4 h-7 w-44 rounded-md" />
      <div
        className={`relative ${shimmer} overflow-hidden rounded-xl bg-transparent p-4`}
      >
        <div className="mt-0 h-[384px] w-full min-w-[656px] grid-cols-12 items-end gap-2 rounded-md bg-transparent p-4 md:gap-4" />
      </div>
    </div>
  );
};

export function InvoiceSkeleton() {
  return (
    <div className="bg-default-100 flex min-h-[70px] w-full min-w-72 max-w-md flex-row items-center justify-between rounded-xl px-3 py-4">
      <div className="min-w-0">
        <div className="bg-default-500 h-4 w-24 rounded-md" />
        <div className="bg-default-300 mt-2 h-3 w-36 rounded-md" />
      </div>
      <div className="bg-default-500 ml-4 mt-2 h-4 w-16 rounded-md" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div className="flex w-full min-w-72 max-w-md flex-col">
      <div className="bg-default-500 mb-7 h-7 w-40 rounded-md" />
      <div
        className={`relative ${shimmer} flex flex-col justify-between overflow-hidden rounded-xl`}
      >
        <div className="flex flex-col gap-2">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
      </div>
    </div>
  );
}
