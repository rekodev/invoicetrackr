import ExpenseTable from '@/components/expense/expense-table';
import { auth } from '@/auth';
import { getExpenses } from '@/api/expense';
import { isResponseError } from '@/lib/utils/error';

export default async function ExpensesPageContent() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  const expensesResponse = await getExpenses(userId);

  if (isResponseError(expensesResponse)) {
    throw new Error('Failed to fetch expenses');
  }

  return (
    <ExpenseTable userId={userId} expenses={expensesResponse.data.expenses} />
  );
}
