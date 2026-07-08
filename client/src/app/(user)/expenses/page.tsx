import { Suspense } from 'react';

import { ExpenseTableSkeleton } from '@/components/ui/skeletons/expense-skeleton';

import ExpensesPageContent from './expenses-page-content';

const ExpensesPage = async () => {
  return (
    <Suspense fallback={<ExpenseTableSkeleton />}>
      <ExpensesPageContent />
    </Suspense>
  );
};

export default ExpensesPage;
