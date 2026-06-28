'use client';

import { Card, Skeleton } from '@heroui/react';

export function AuthPageSkeleton() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-lg border p-8">
        <Skeleton className="mx-auto h-10 w-10 rounded-xl" />
        <Skeleton className="mx-auto mt-5 h-7 w-44 rounded-xl" />
        <Skeleton className="mx-auto mt-3 h-4 w-64 rounded-xl" />
        <Skeleton className="mt-8 h-11 w-full rounded-xl" />
        <div className="flex items-center gap-3 py-5">
          <Skeleton className="h-px flex-1 rounded-xl" />
          <Skeleton className="h-3 w-24 rounded-xl" />
          <Skeleton className="h-px flex-1 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </Card>
    </section>
  );
}

export function CreateInvoicePageSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10 md:py-12 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end">
        <div>
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="mt-4 h-10 w-full max-w-2xl rounded-xl" />
          <Skeleton className="mt-3 h-5 w-full max-w-xl rounded-xl" />
        </div>
        <Card className="border p-4">
          <Skeleton className="h-5 w-40 rounded-xl" />
          <Skeleton className="mt-3 h-4 w-full rounded-xl" />
          <Skeleton className="mt-4 h-10 w-full rounded-xl" />
        </Card>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <Card className="mt-8 border p-4 sm:p-8">
        <Skeleton className="h-6 w-36 rounded-xl" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-xl" />
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-[360px] rounded-3xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-[220px] rounded-3xl" />
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Skeleton className="h-10 w-full rounded-xl sm:w-28" />
          <Skeleton className="h-10 w-full rounded-xl sm:w-44" />
        </div>
      </Card>
    </section>
  );
}

export function PublicInvoicePageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border p-4 sm:p-6">
          <Skeleton className="h-[720px] w-full rounded-xl" />
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="border p-5">
            <Skeleton className="h-6 w-44 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-full rounded-xl" />
            <Skeleton className="mt-6 h-10 w-full rounded-xl" />
          </Card>
          <Card className="border p-5">
            <Skeleton className="h-5 w-36 rounded-xl" />
            <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          </Card>
        </div>
      </div>
    </main>
  );
}

export function LegalPageSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Skeleton className="h-9 w-56 rounded-xl" />
      <Skeleton className="mt-3 h-4 w-40 rounded-xl" />
      <div className="mt-8 space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <section key={index}>
            <Skeleton className="h-6 w-64 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-full rounded-xl" />
            <Skeleton className="mt-2 h-4 w-11/12 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-xl" />
          </section>
        ))}
      </div>
    </main>
  );
}
