const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export const DashboardCardSkeleton = () => {
  return (
    <div
      className={`${shimmer} flex flex-col gap-2 relative overflow-hidden rounded-xl bg-default-100 p-2 shadow-sm`}
    >
      <div className="flex gap-1 my-2">
        <div className="h-5 w-5 rounded-md bg-default-600" />
        <div className="h-5 w-16 rounded-md bg-default-600 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-default-200 px-4 py-6">
        <div className="h-7 w-20 rounded-md bg-default-600" />
      </div>
    </div>
  );
};

export const DashboardCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
      <DashboardCardSkeleton />
    </div>
  );
};

export const RevenueChartSkeleton = () => {
  return (
    <div className="overflow-hidden md:col-span-4">
      <div className="mb-4 h-7 w-44 rounded-md bg-gray-100" />
      <div
        className={`relative ${shimmer} overflow-hidden bg-transparent p-4 rounded-xl`}
      >
        <div className="mt-0 grid h-[384px] min-w-[656px] grid-cols-12 items-end gap-2 rounded-md bg-transparent p-4 sm:grid-cols-13 md:gap-4" />
      </div>
    </div>
  );
};

export function InvoiceSkeleton() {
  return (
    <div className="px-3 flex bg-default-100 flex-row items-center justify-between py-4 min-h-[70px] rounded-xl min-w-72">
      <div className="min-w-0">
        <div className="h-4 w-24 rounded-md bg-gray-200" />
        <div className="mt-2 h-3 w-36 rounded-md bg-default-300" />
      </div>
      <div className="ml-4 mt-2 h-4 w-16 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div className="flex flex-col md:col-span-4">
      <div className="mb-7 h-7 w-40 rounded-md bg-gray-200" />
      <div
        className={`relative ${shimmer} overflow-hidden flex grow flex-col justify-between rounded-xl`}
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
