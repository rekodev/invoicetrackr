import { notFound, unauthorized } from 'next/navigation';

import { getExpense, getExpenseAttachments } from '@/api/expense';
import { auth } from '@/auth';
import ExpenseWorkspace from '@/components/expense/expense-workspace';
import { isResponseError } from '@/lib/utils/error';
import { safeExpenseReturnTo } from '@/lib/utils/expense-navigation';

type Props = {
  params: Promise<{ expenseId: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function ExpenseWorkspacePage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const { expenseId } = await params;
  if (!/^[1-9]\d*$/.test(expenseId) || !Number.isSafeInteger(Number(expenseId))) notFound();
  const userId = Number(session.user.id);
  const [response, documents, query] = await Promise.all([
    getExpense({ userId, expenseId: Number(expenseId) }),
    getExpenseAttachments(userId, Number(expenseId)),
    searchParams
  ]);
  if (isResponseError(response)) {
    if (response.status === 404) notFound();
    throw new Error('Failed to load expense');
  }
  return <ExpenseWorkspace userId={userId} expense={response.data.expense}
    attachments={isResponseError(documents) ? null : documents.data.attachments}
    returnTo={safeExpenseReturnTo(query.returnTo)} />;
}
