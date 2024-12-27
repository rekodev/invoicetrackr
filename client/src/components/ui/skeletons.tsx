const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export const CardSkeleton = () => {
  return (
    <div
      className={`${shimmer} flex flex-col gap-2 relative overflow-hidden rounded-xl bg-default-100 p-2 shadow-sm`}
    >
      <div className='flex gap-1 my-2'>
        <div className='h-5 w-5 rounded-md bg-default-600' />
        <div className='h-5 w-16 rounded-md bg-default-600 text-sm font-medium' />
      </div>
      <div className='flex items-center justify-center truncate rounded-xl bg-default-200 px-4 py-6'>
        <div className='h-7 w-20 rounded-md bg-default-600' />
      </div>
    </div>
  );
};

export const CardsSkeleton = () => {
  return (
    <div className='grid grid-cols-4 gap-4'>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
};

// TODO: Adjust based on actual chart
export const RevenueChartSkeleton = () => {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className='mb-4 h-8 w-36 rounded-md bg-gray-100' />
      <div className='rounded-xl bg-gray-100 p-4'>
        <div className='mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:grid-cols-13 md:gap-4' />
        <div className='flex items-center pb-2 pt-6'>
          <div className='h-5 w-5 rounded-full bg-gray-200' />
          <div className='ml-2 h-4 w-20 rounded-md bg-gray-200' />
        </div>
      </div>
    </div>
  );
};

// TODO: Adjust based on client card
export function InvoiceSkeleton() {
  return (
    <div className='flex flex-row items-center justify-between border-b border-gray-100 py-4'>
      <div className='flex items-center'>
        <div className='mr-2 h-8 w-8 rounded-full bg-gray-200' />
        <div className='min-w-0'>
          <div className='h-5 w-40 rounded-md bg-gray-200' />
          <div className='mt-2 h-4 w-12 rounded-md bg-gray-200' />
        </div>
      </div>
      <div className='mt-2 h-4 w-12 rounded-md bg-gray-200' />
    </div>
  );
}

// TODO: Adjust based on client cards
export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className='mb-4 h-8 w-36 rounded-md bg-gray-100' />
      <div className='flex grow flex-col justify-between rounded-xl bg-gray-100 p-4'>
        <div className='bg-white px-6'>
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className='flex items-center pb-2 pt-6'>
          <div className='h-5 w-5 rounded-full bg-gray-200' />
          <div className='ml-2 h-4 w-20 rounded-md bg-gray-200' />
        </div>
      </div>
    </div>
  );
}
