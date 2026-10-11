import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export const AnnualPackageSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-6">
    <BasicCardGridSkeleton
      count={4}
      className="gap-5 sm:grid-cols-2 lg:grid-cols-4"
      cardClassName="min-h-[122px]"
    />
    <BasicCardSkeleton className="min-h-[320px]" />
  </div>
);
