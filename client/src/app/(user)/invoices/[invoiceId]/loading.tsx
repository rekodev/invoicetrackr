import { Skeleton } from '@heroui/react';

export default function InvoiceWorkspaceLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-5" aria-busy="true">
      <Skeleton className="h-8 w-48 rounded-md" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="aspect-[794/1123] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    </section>
  );
}
