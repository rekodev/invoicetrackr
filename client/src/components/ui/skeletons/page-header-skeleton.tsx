import { cn, Skeleton } from '@heroui/react';

type Props = { hasDescription?: boolean; hasActions?: boolean };

export default function PageHeaderSkeleton({
  hasDescription,
  hasActions = true
}: Props) {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn('flex items-center', hasActions && 'min-h-page-heading')}
      >
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>
      {hasDescription && <Skeleton className="h-5 w-64 max-w-full rounded-lg" />}
    </>
  );
}
