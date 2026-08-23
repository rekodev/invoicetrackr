import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export const DashboardCardsSkeleton = () => (
  <BasicCardGridSkeleton
    count={4}
    className="md:grid-cols-2 lg:grid-cols-4"
    cardClassName="min-h-[122px]"
  />
);

export const RevenueChartSkeleton = () => (
  <BasicCardSkeleton className="min-h-[448px]" />
);

export function LatestInvoicesSkeleton() {
  return <BasicCardSkeleton className="min-h-[448px] xl:max-w-lg" />;
}
