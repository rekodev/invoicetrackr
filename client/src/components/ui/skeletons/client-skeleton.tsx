import { BasicCardGridSkeleton } from './basic-card-skeleton';

export function ClientSectionSkeleton() {
  return (
    <BasicCardGridSkeleton
      count={6}
      className="xl:grid-cols-3"
      cardClassName="min-h-[182px]"
    />
  );
}
