import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expense } from '@/test/expense-fixtures';
import { withIntl } from '@/test/with-intl';

import ExpenseWorkspace from '../expense-workspace';

const navigation = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('../expense-documents', () => ({ default: () => <div>Documents</div> }));
vi.mock('../expense-form-dialog', () => ({ default: ({ onSaved, onClose }: { onSaved: () => void; onClose: () => void }) =>
  <div role="dialog"><button onClick={onSaved}>Save changes</button><button onClick={onClose}>Cancel edit</button></div> }));
vi.mock('../delete-expense-modal', () => ({ default: ({ onDeleted }: { onDeleted: () => void }) => <button onClick={onDeleted}>Confirm deletion</button> }));
const returnTo = '/expenses?q=internet&page=2';

describe('expense workspace', () => {
  it('shows saved details with the deduction explanation available on demand', async () => {
    render(withIntl(<ExpenseWorkspace userId={1} expense={expense} attachments={[]} returnTo={returnTo} />));
    expect(screen.queryByText('€100.00 × 50% = €50.00')).not.toBeInTheDocument();
    await userEvent.hover(screen.getByRole('button', { name: 'How the deductible amount is calculated' }));
    expect(await screen.findByText('€100.00 × 50% = €50.00')).toBeInTheDocument();
    expect(screen.getByText('R-42')).toBeInTheDocument();
    expect(screen.getByText('For client work')).toBeInTheDocument();
    expect(screen.getByText('€21.00')).toBeInTheDocument();
    expect(screen.getAllByText('Not set')).toHaveLength(1);
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.queryByText('checksum')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back to expenses' })).not.toBeInTheDocument();
  });
  it.each([
    ['0', '0.00', '0'], ['33.33', '33.33', '33.33'], ['100', '100.00', '100']
  ])('explains saved business use %s without recalculating', async (percentage, deductible, displayed) => {
    render(withIntl(<ExpenseWorkspace userId={1} expense={{ ...expense, businessUsePercentage: percentage, deductibleAmount: deductible }} attachments={[]} returnTo={returnTo} />));
    await userEvent.hover(screen.getByRole('button', { name: 'How the deductible amount is calculated' }));
    expect(await screen.findByText(`€100.00 × ${displayed}% = €${deductible}`)).toBeInTheDocument();
  });
  it('keeps edit save and cancel on the same expense and returns deletion to list context', () => {
    render(withIntl(<ExpenseWorkspace userId={1} expense={expense} attachments={[]} returnTo={returnTo} />));
    fireEvent.click(screen.getByRole('button', { name: 'Edit expense' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(navigation.refresh).toHaveBeenCalledOnce();
    expect(navigation.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete expense' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }));
    expect(navigation.push).toHaveBeenCalledWith(returnTo);
  });
});
