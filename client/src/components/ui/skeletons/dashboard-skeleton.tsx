import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export const MoneyWorkbenchSkeleton = () => (
  <div aria-hidden="true" className="flex flex-col gap-5">
    <BasicCardGridSkeleton
      count={3}
      className="gap-5 sm:grid-cols-3"
      cardClassName="min-h-[122px]"
    />
    <BasicCardSkeleton className="min-h-[240px]" />
    <BasicCardSkeleton className="min-h-[448px]" />
  </div>
);
