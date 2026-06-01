const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export const DashboardCardSkeleton = () => {
  return (
    <div
      className={`${shimmer} border-default-200 relative flex min-h-32 flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-sm sm:p-5`}
    >
      <div className="flex items-center gap-2">
        <div className="bg-default-200 h-8 w-8 rounded-lg" />
        <div className="bg-default-300 h-4 w-20 rounded-md" />
      </div>
      <div className="bg-default-300 mt-5 h-7 w-24 rounded-md" />
    </div>
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
    <div className="border-default-200 flex w-full flex-col overflow-hidden rounded-xl border p-5 shadow-sm sm:p-6">
      <div className="bg-default-300 h-5 w-36 rounded-md" />
      <div
        className={`relative ${shimmer} mt-4 overflow-hidden rounded-xl bg-transparent`}
      >
        <div className="h-[384px] w-full min-w-[656px] grid-cols-12 items-end gap-2 rounded-md bg-transparent md:gap-4" />
      </div>
    </div>
  );
};

export function InvoiceSkeleton() {
  return (
    <div className="flex min-h-[64px] w-full items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="bg-default-300 h-4 w-36 rounded-md" />
        <div className="bg-default-200 mt-2 h-3 w-48 rounded-md" />
      </div>
      <div className="bg-default-300 ml-4 h-4 w-16 shrink-0 rounded-md" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div className="border-default-200 w-full min-w-72 rounded-xl border p-5 shadow-sm sm:p-6 xl:max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="bg-default-300 h-5 w-32 rounded-md" />
          <div className="bg-default-200 mt-2 h-3 w-28 rounded-md" />
        </div>
        <div className="bg-default-200 h-7 w-20 rounded-lg" />
      </div>
      <div
        className={`relative ${shimmer} divide-default-200 mt-4 flex flex-col divide-y overflow-hidden`}
      >
        <InvoiceSkeleton />
        <InvoiceSkeleton />
        <InvoiceSkeleton />
        <InvoiceSkeleton />
        <InvoiceSkeleton />
      </div>
    </div>
  );
}
