import { render, screen } from '@testing-library/react';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExpense, getExpenseAttachments } from '@/api/expense';
import ExpenseWorkspacePage from '@/app/(user)/expenses/[expenseId]/page';
import { auth } from '@/auth';
import { expense } from '@/test/expense-fixtures';

vi.mock('@/api/expense', () => ({ getExpense: vi.fn(), getExpenseAttachments: vi.fn() }));
vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND'); }, unauthorized: () => { throw new Error('UNAUTHORIZED'); } }));
vi.mock('@/components/expense/expense-workspace', () => ({ default: ({ attachments, returnTo }: { attachments: unknown; returnTo: string }) =>
  <div><span>{attachments === null ? 'Document loading failed' : 'Documents loaded'}</span><a href={returnTo}>Return</a></div> }));
const props = (id = '10', returnTo = '/expenses?q=internet') => ({ params: Promise.resolve({ expenseId: id }), searchParams: Promise.resolve({ returnTo }) });
const apiResponse = <T,>(data: T, status = 200): AxiosResponse<T> => ({
  data, status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }
});
beforeEach(() => {
  vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as never);
  vi.mocked(getExpense).mockResolvedValue(apiResponse({ expense }));
  vi.mocked(getExpenseAttachments).mockResolvedValue(apiResponse({ attachments: [] }));
});

describe('expense detail page', () => {
  it.each(['abc', '0', '-1', '9007199254740992'])('rejects invalid expense ID %s before fetching', async (id) => {
    await expect(ExpenseWorkspacePage(props(id))).rejects.toThrow('NOT_FOUND');
    expect(getExpense).not.toHaveBeenCalled();
  });
  it('requires authentication', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    await expect(ExpenseWorkspacePage(props())).rejects.toThrow('UNAUTHORIZED');
  });
  it('returns not found for deleted or inaccessible expenses', async () => {
    vi.mocked(getExpense).mockResolvedValue(apiResponse({ errors: [], message: 'Not found', code: 'NOT_FOUND' }, 404));
    await expect(ExpenseWorkspacePage(props())).rejects.toThrow('NOT_FOUND');
  });
  it('keeps details available when document loading fails and validates return navigation', async () => {
    vi.mocked(getExpenseAttachments).mockResolvedValue(apiResponse({ errors: [], message: 'Unavailable', code: 'ERROR' }, 500));
    render(await ExpenseWorkspacePage(props('10', 'https://external.example')));
    expect(screen.getByText('Document loading failed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return' })).toHaveAttribute('href', '/expenses');
  });
});
