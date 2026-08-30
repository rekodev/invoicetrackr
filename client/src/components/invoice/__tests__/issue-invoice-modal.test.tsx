import type { InvoiceBody } from '@invoicetrackr/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import IssueInvoiceModal from '../issue-invoice-modal';

const { mockIssueInvoiceAction } = vi.hoisted(() => ({
  mockIssueInvoiceAction: vi.fn()
}));

vi.mock('@/lib/actions/invoice', () => ({
  issueInvoiceAction: mockIssueInvoiceAction
}));

const invoiceData: InvoiceBody = {
  id: 42,
  bankingInformation: {
    name: 'Test Bank',
    code: 'TESTLT21',
    accountNumber: 'LT000000000000000000'
  },
  sender: {
    name: 'Test Sender',
    address: 'Sender address',
    email: 'sender@example.com',
    businessNumber: '123456789',
    businessType: 'individual',
    type: 'sender'
  },
  receiver: {
    name: 'Test Client',
    address: 'Client address',
    email: 'client@example.com',
    businessNumber: '987654321',
    businessType: 'business',
    type: 'receiver'
  },
  totalAmount: '100.00',
  date: '2026-08-30',
  serviceDate: '2026-08-30',
  dueDate: '2026-09-29',
  status: 'pending',
  lifecycleStatus: 'draft',
  paymentMode: 'manual',
  services: [
    {
      position: 0,
      description: 'Consulting',
      quantity: 1,
      unit: 'hour',
      amount: 100
    }
  ]
};

describe('<IssueInvoiceModal />', () => {
  beforeEach(() => {
    mockIssueInvoiceAction.mockResolvedValue({
      ok: true,
      message: 'Invoice issued'
    });
  });

  it('states that issuing does not send email', async () => {
    const user = userEvent.setup();
    render(
      withIntl(<IssueInvoiceModal userId={1} invoiceData={invoiceData} />)
    );

    await user.click(screen.getByRole('button', { name: 'Issue invoice' }));

    expect(
      screen.getByText(/This action does not send an email/i)
    ).toBeInTheDocument();
  });

  it('issues the invoice and closes after success', async () => {
    const user = userEvent.setup();
    render(
      withIntl(<IssueInvoiceModal userId={1} invoiceData={invoiceData} />)
    );

    await user.click(screen.getByRole('button', { name: 'Issue invoice' }));
    const dialog = screen.getByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Issue invoice' })
    );

    expect(mockIssueInvoiceAction).toHaveBeenCalledWith(1, 42);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
