'use client';

import { Card, Skeleton } from '@heroui/react';
import { cn } from '@heroui/styles';

type BasicCardSkeletonProps = {
  className?: string;
};

export function BasicCardSkeleton({ className }: BasicCardSkeletonProps) {
  return (
    <Card
      aria-hidden="true"
      className={cn('min-h-32 w-full border p-4', className)}
    >
      <Skeleton className="h-full min-h-24 w-full rounded-xl" />
    </Card>
  );
}

type BasicCardGridSkeletonProps = {
  count?: number;
  className?: string;
  cardClassName?: string;
};

export function BasicCardGridSkeleton({
  count = 3,
  className,
  cardClassName
}: BasicCardGridSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <BasicCardSkeleton key={index} className={cardClassName} />
      ))}
    </div>
  );
}
