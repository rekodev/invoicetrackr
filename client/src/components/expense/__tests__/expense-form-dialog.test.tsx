import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { addExpenseAction, updateExpenseAction, uploadExpenseAttachmentAction } from '@/lib/actions/expense';
import { attachment, expense } from '@/test/expense-fixtures';
import { withIntl } from '@/test/with-intl';

import ExpenseFormDialog from '../expense-form-dialog';

vi.mock('@/lib/actions/expense', () => ({ addExpenseAction: vi.fn(), updateExpenseAction: vi.fn(), uploadExpenseAttachmentAction: vi.fn() }));

describe('expense form dialog', () => {
  it('retries only the upload after creation succeeds and preserves access to the saved expense', async () => {
    vi.mocked(addExpenseAction).mockResolvedValue({ ok: true, message: 'Created', data: expense });
    vi.mocked(uploadExpenseAttachmentAction).mockResolvedValueOnce({ ok: false, message: 'Upload failed' })
      .mockResolvedValueOnce({ ok: true, message: 'Uploaded', data: attachment });
    const onClose = vi.fn();
    render(withIntl(<ExpenseFormDialog userId={1} isOpen onClose={onClose} returnTo="/expenses?q=internet" />));
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: 'Telia' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Internet' } });
    fireEvent.change(screen.getByLabelText('Total Amount'), { target: { value: '100.00' } });
    await userEvent.upload(document.querySelector('input[type="file"]') as HTMLInputElement, new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed');
    expect(screen.getByRole('link', { name: 'Open saved expense' })).toHaveAttribute('href', '/expenses/10?returnTo=%2Fexpenses%3Fq%3Dinternet');
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry upload' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(addExpenseAction).toHaveBeenCalledOnce();
    expect(addExpenseAction).toHaveBeenCalledWith({
      userId: 1,
      expenseData: expect.objectContaining({ totalAmount: '100.00', eurAmount: undefined })
    });
    expect(uploadExpenseAttachmentAction).toHaveBeenCalledTimes(2);
    expect(uploadExpenseAttachmentAction).toHaveBeenLastCalledWith(expect.objectContaining({ expenseId: 10 }));
  });

  it('edits expense fields without showing an upload and notifies the existing detail context', async () => {
    vi.mocked(updateExpenseAction).mockResolvedValue({ ok: true, message: 'Updated', data: expense });
    const onSaved = vi.fn();
    render(withIntl(<ExpenseFormDialog userId={1} mode="edit" expenseData={expense} isOpen onClose={vi.fn()} onSaved={onSaved} />));
    expect(document.querySelector('input[type="file"]')).toBeNull();
    fireEvent.change(screen.getByLabelText('Total Amount'), { target: { value: '120.00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expense));
    expect(uploadExpenseAttachmentAction).not.toHaveBeenCalled();
    expect(updateExpenseAction).toHaveBeenCalledWith({
      userId: 1,
      expenseId: expense.id,
      expenseData: expect.objectContaining({ totalAmount: '120.00', eurAmount: undefined })
    });
  });

  it('renders server validation errors on the rejected fields and allows correction', async () => {
    vi.mocked(addExpenseAction).mockResolvedValueOnce({
      ok: false,
      message: 'Review fields and retry',
      validationErrors: { supplier: 'Enter a supplier', totalAmount: 'Enter a valid amount' }
    }).mockResolvedValueOnce({ ok: true, message: 'Created', data: expense });
    const onClose = vi.fn();
    render(withIntl(<ExpenseFormDialog userId={1} isOpen onClose={onClose} />));
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Review fields and retry');
    expect(screen.getByLabelText('Supplier')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Total Amount')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a supplier')).toBeVisible();
    expect(screen.getByText('Enter a valid amount')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: 'Telia' } });
    fireEvent.change(screen.getByLabelText('Total Amount'), { target: { value: '100.00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
