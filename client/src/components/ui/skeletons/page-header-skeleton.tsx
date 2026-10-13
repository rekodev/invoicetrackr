import { Skeleton } from '@heroui/react';

type Props = { hasDescription?: boolean };

export default function PageHeaderSkeleton({ hasDescription }: Props) {
  return (
    <>
      <div aria-hidden="true" className="min-h-page-heading flex items-center">
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>
      {hasDescription && <Skeleton className="h-5 w-64 max-w-full rounded-lg" />}
    </>
  );
}
