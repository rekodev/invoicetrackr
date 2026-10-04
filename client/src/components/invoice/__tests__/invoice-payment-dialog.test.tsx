import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { saveInvoicePaymentAction } from '@/lib/actions/invoice';
import { withIntl } from '@/test/with-intl';

import InvoicePaymentDialog from '../invoice-payment-dialog';

vi.mock('@/lib/actions/invoice', () => ({ saveInvoicePaymentAction: vi.fn() }));

describe('invoice payment dialog', () => {
  it('keeps entered values and shows server errors after a concurrent balance change', async () => {
    const onSaved = vi.fn();
    vi.mocked(saveInvoicePaymentAction).mockResolvedValueOnce({
      ok: false, message: 'Balance changed. Maximum €20.00.', validationErrors: { amount: 'Maximum €20.00.' }, transportUnknown: false
    });
    render(withIntl(<InvoicePaymentDialog userId={1} invoiceId={7} outstandingAmount="60.00"
      payment={null} onClose={vi.fn()} onSaved={onSaved} onRefresh={vi.fn()} />));
    const amount = screen.getByRole('spinbutton', { name: 'Amount received' });
    fireEvent.change(amount, { target: { value: '50.50' } });
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'First line\nSecond line' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save payment' }));
    expect(await screen.findByText('Maximum €20.00.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Balance changed');
    expect(amount).toHaveValue(50.5);
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('First line\nSecond line');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('allows editing the existing amount and blocks repeat saves while pending', async () => {
    const onSaved = vi.fn();
    let complete!: (_result: Awaited<ReturnType<typeof saveInvoicePaymentAction>>) => void;
    vi.mocked(saveInvoicePaymentAction).mockReturnValueOnce(new Promise((resolve) => { complete = resolve; }));
    render(withIntl(<InvoicePaymentDialog userId={1} invoiceId={7} outstandingAmount="60.00"
      payment={{ id: 3, amount: '40.00', paymentDate: '2000-01-01', createdAt: '2000-01-01T00:00:00Z' }}
      onClose={vi.fn()} onSaved={onSaved} onRefresh={vi.fn()} />));
    expect(screen.getByText('Maximum amount: €100.00')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Amount received' }), { target: { value: '100' } });
    const save = screen.getByRole('button', { name: 'Save payment' });
    await userEvent.click(save);
    await waitFor(() => expect(save).toBeDisabled());
    await userEvent.click(save);
    expect(saveInvoicePaymentAction).toHaveBeenCalledTimes(1);
    complete({ ok: true, message: '' });
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('requires refreshing instead of resubmitting when the save result is unknown', async () => {
    const onSaved = vi.fn();
    const onRefresh = vi.fn();
    vi.mocked(saveInvoicePaymentAction).mockResolvedValueOnce({
      ok: false, message: 'Connection failed', validationErrors: {}, transportUnknown: true
    });
    render(withIntl(<InvoicePaymentDialog userId={1} invoiceId={7} outstandingAmount="60.00"
      payment={null} onClose={vi.fn()} onSaved={onSaved} onRefresh={onRefresh} />));
    const amount = screen.getByRole('spinbutton', { name: 'Amount received' });
    fireEvent.change(amount, { target: { value: '20.00' } });
    await userEvent.click(screen.getByRole('button', { name: 'Save payment' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('The result could not be confirmed'));
    expect(amount).toHaveValue(20);
    expect(amount).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save payment' })).not.toBeInTheDocument();
    expect(saveInvoicePaymentAction).toHaveBeenCalledOnce();
    expect(onSaved).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Refresh workspace' }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
