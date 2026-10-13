import { Skeleton } from '@heroui/react';

import { BasicCardSkeleton } from './basic-card-skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-48 rounded-lg" />
      <BasicCardSkeleton className="min-h-[480px]" />
    </div>
  );
}
