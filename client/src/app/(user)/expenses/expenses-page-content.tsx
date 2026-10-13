import { getExpenses } from '@/api/expense';
import ExpenseTable from '@/components/expense/expense-table';
import { isResponseError } from '@/lib/utils/error';

type Props = { userId: number };

export default async function ExpensesPageContent({ userId }: Props) {
  const expensesResponse = await getExpenses(userId);

  if (isResponseError(expensesResponse)) {
    throw new Error('Failed to fetch expenses');
  }

  return (
    <ExpenseTable userId={userId} expenses={expensesResponse.data.expenses} />
  );
}
