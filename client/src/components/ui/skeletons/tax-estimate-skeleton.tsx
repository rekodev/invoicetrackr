import { BasicCardSkeleton } from './basic-card-skeleton';

export const TaxEstimateSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-8">
    <BasicCardSkeleton className="min-h-[96px]" />
    <BasicCardSkeleton className="min-h-[240px]" />
    <BasicCardSkeleton className="min-h-[480px]" />
    <BasicCardSkeleton className="min-h-[120px]" />
  </div>
);
