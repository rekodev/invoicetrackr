import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export function ExpenseWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-section">
      <BasicCardGridSkeleton
        count={3}
        className="sm:grid-cols-3 md:grid-cols-3"
        cardClassName="min-h-[122px]"
      />
      <div className="grid items-start gap-section lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <BasicCardSkeleton className="min-h-[360px]" />
        <BasicCardSkeleton className="min-h-[240px]" />
      </div>
    </div>
  );
}

export function ExpenseTableSkeleton() {
  return (
    <div className="flex flex-col gap-section">
      <BasicCardGridSkeleton
        count={3}
        className="md:grid-cols-3"
        cardClassName="min-h-[122px]"
      />
      <BasicCardSkeleton className="min-h-[480px]" />
    </div>
  );
}
