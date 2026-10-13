import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { auth } from '@/auth';
import AddExpenseButton from '@/components/expense/add-expense-button';
import PageHeader from '@/components/ui/page-header';
import { ExpenseTableSkeleton } from '@/components/ui/skeletons/expense-skeleton';

import ExpensesPageContent from './expenses-page-content';

const ExpensesPage = async () => {
  const session = await auth();
  if (!session?.user?.id) unauthorized();

  const t = await getTranslations('breadcrumbs');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('expenses')}>
        <AddExpenseButton userId={Number(session.user.id)} />
      </PageHeader>
      <Suspense fallback={<ExpenseTableSkeleton />}>
        <ExpensesPageContent />
      </Suspense>
    </section>
  );
};

export default ExpensesPage;
