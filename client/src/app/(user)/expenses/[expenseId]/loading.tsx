import { ExpenseWorkspaceSkeleton } from '@/components/ui/skeletons/expense-skeleton';
import PageHeaderSkeleton from '@/components/ui/skeletons/page-header-skeleton';

export default function Loading() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-section">
      <PageHeaderSkeleton />
      <ExpenseWorkspaceSkeleton />
    </section>
  );
}
