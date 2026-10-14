import { BasicCardSkeleton } from './basic-card-skeleton';
import PageHeaderSkeleton from './page-header-skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-section">
      <PageHeaderSkeleton hasActions={false} />
      <BasicCardSkeleton className="min-h-[480px]" />
    </div>
  );
}
