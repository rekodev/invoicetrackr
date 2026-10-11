import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export const TaxEstimateSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-6">
    <BasicCardSkeleton className="min-h-[140px]" />
    <BasicCardGridSkeleton
      count={2}
      className="gap-5 md:grid-cols-2 lg:grid-cols-2"
      cardClassName="min-h-[420px]"
    />
  </div>
);
