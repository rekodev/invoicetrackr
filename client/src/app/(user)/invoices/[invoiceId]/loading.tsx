import { Skeleton } from '@heroui/react';

import PageHeaderSkeleton from '@/components/ui/skeletons/page-header-skeleton';

export default function InvoiceWorkspaceLoading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-section" aria-busy="true">
      <PageHeaderSkeleton hasDescription />
      <div className="grid gap-section lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="aspect-[794/1123] w-full rounded-lg" />
        <div className="space-y-field">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    </section>
  );
}
