'use client';

import { Skeleton } from '@heroui/react';

export default function UserNavCardSkeleton() {
  return (
    <Skeleton className="h-[25rem] w-full rounded-3xl sm:min-w-64 sm:max-w-64" />
  );
}
