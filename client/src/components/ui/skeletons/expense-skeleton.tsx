import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export function ExpenseTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <BasicCardGridSkeleton
        count={3}
        className="gap-3 md:grid-cols-3"
        cardClassName="min-h-[122px]"
      />
      <BasicCardSkeleton className="min-h-[480px]" />
    </div>
  );
}
