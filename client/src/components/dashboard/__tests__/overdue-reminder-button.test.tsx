import type { InvoiceWorkspaceResponse } from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getInvoiceWorkspaceAction } from '@/lib/actions/invoice';
import { withIntl } from '@/test/with-intl';

import OverdueReminderButton from '../overdue-reminder-button';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/lib/actions/invoice', () => ({
  getInvoiceWorkspaceAction: vi.fn(),
  sendInvoiceEmailAction: vi.fn(),
  recoverInvoiceEmailAction: vi.fn()
}));

const workspace = {
  invoice: {
    id: 7,
    invoiceId: 'SF007',
    receiver: { name: 'Late Client', email: 'client@example.com' },
    totalAmount: '200.00',
    documentLanguage: 'en',
    currency: 'eur',
    dueDate: '2026-09-30',
    lifecycleStatus: 'issued'
  },
  balance: { paidAmount: '50.00', outstandingAmount: '150.00' },
  payments: [],
  deliveries: [
    { id: 1, recipient: 'billing@example.com', kind: 'invoice', status: 'delivered' }
  ],
  canCopyPublicLink: false
} as unknown as InvoiceWorkspaceResponse;

describe('<OverdueReminderButton />', () => {
  it('loads the invoice and opens a reminder addressed to the last delivered recipient', async () => {
    vi.mocked(getInvoiceWorkspaceAction).mockResolvedValue({ ok: true, data: workspace });
    render(withIntl(
      <OverdueReminderButton userId={1} invoiceId={7} invoiceLabel="SF007" isEmailVerified />
    ));

    await userEvent.click(screen.getByRole('button', { name: 'Send reminder for SF007' }));

    expect(getInvoiceWorkspaceAction).toHaveBeenCalledWith(1, 7);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('billing@example.com')).toBeInTheDocument();
  });

  it('keeps reminders disabled until the sender email is verified', () => {
    render(withIntl(
      <OverdueReminderButton userId={1} invoiceId={7} invoiceLabel="SF007" isEmailVerified={false} />
    ));

    expect(screen.getByRole('button', { name: 'Send reminder for SF007' })).toBeDisabled();
    expect(getInvoiceWorkspaceAction).not.toHaveBeenCalled();
  });
});
