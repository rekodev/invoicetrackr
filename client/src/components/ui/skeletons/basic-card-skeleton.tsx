'use client';

import { Skeleton } from '@heroui/react';
import { cn } from '@heroui/styles';

type BasicCardSkeletonProps = {
  className?: string;
};

export function BasicCardSkeleton({ className }: BasicCardSkeletonProps) {
  return (
    <Skeleton
      aria-hidden="true"
      className={cn('min-h-32 w-full rounded-3xl', className)}
    />
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
        'gap-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <BasicCardSkeleton key={index} className={cardClassName} />
      ))}
    </div>
  );
}
