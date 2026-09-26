import type { InvoiceBody, InvoiceEmailDelivery } from '@invoicetrackr/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recoverInvoiceEmailAction, sendInvoiceEmailAction } from '@/lib/actions/invoice';
import { withIntl } from '@/test/with-intl';

import SendInvoiceEmailModal from '../send-invoice-email-modal';

vi.mock('@/lib/actions/invoice', () => ({ sendInvoiceEmailAction: vi.fn(), recoverInvoiceEmailAction: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const invoice = { id: 7, invoiceId: 'SF007', receiver: { name: 'Client', email: 'client@example.com' },
  totalAmount: '100.00', documentLanguage: 'lt', currency: 'eur', dueDate: '2026-10-20', lifecycleStatus: 'issued'
} as InvoiceBody;
const content = { recipientEmail: 'previous@example.com', subject: 'My previous subject',
  message: 'My previous message', language: 'en' as const, kind: 'invoice' as const,
  includePublicLink: false, requestSignature: false };
const delivery: InvoiceEmailDelivery = { id: 9, recipient: content.recipientEmail, kind: 'invoice', status: 'sent', content };
const open = (props: Partial<Parameters<typeof SendInvoiceEmailModal>[0]> = {}) => render(withIntl(
  <SendInvoiceEmailModal userId={2} invoice={invoice} isEmailVerified kind="invoice"
    outstandingAmount="60.00" onClose={vi.fn()} {...props} />
));

describe('invoice email composer', () => {
  beforeEach(() => {
    vi.mocked(sendInvoiceEmailAction).mockResolvedValue({ ok: true, message: 'Accepted', delivery });
    vi.mocked(recoverInvoiceEmailAction).mockResolvedValue({ ok: true, message: 'Accepted', delivery });
  });

  it('translates defaults, preserves edits, and sends an intentionally cleared message', async () => {
    open();
    expect(screen.getByLabelText('Subject')).toHaveValue('Sąskaita SF007 – 100.00 EUR');
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByLabelText('Subject')).toHaveValue('Invoice SF007 – 100.00 EUR');
    await userEvent.clear(screen.getByLabelText('Subject'));
    await userEvent.type(screen.getByLabelText('Subject'), 'Custom subject');
    await userEvent.clear(screen.getByLabelText('Message (Optional)'));
    await userEvent.type(screen.getByLabelText('Message (Optional)'), 'Custom text');
    await userEvent.click(screen.getByRole('button', { name: 'Lietuvių' }));
    expect(screen.getByLabelText('Subject')).toHaveValue('Custom subject');
    expect(screen.getByLabelText('Message (Optional)')).toHaveValue('Custom text');
    await userEvent.click(screen.getByRole('button', { name: /Reset subject and message/ }));
    expect(screen.getByLabelText('Subject')).toHaveValue('Sąskaita SF007 – 100.00 EUR');
    await userEvent.clear(screen.getByLabelText('Message (Optional)'));
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByLabelText('Message (Optional)')).toHaveValue('');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(sendInvoiceEmailAction).toHaveBeenCalledWith(2, 7,
      expect.objectContaining({ message: '' })));
  });

  it('restores previous content, then recovers a lost resend response using its new request', async () => {
    vi.mocked(sendInvoiceEmailAction).mockRejectedValueOnce(new Error('connection lost'));
    open({ delivery });
    expect(screen.getByLabelText('Recipient Email')).toHaveValue(content.recipientEmail);
    expect(screen.getByLabelText('Subject')).toHaveValue(content.subject);
    expect(screen.getByLabelText('Message (Optional)')).toHaveValue(content.message);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(sendInvoiceEmailAction).toHaveBeenCalledWith(2, 7,
      expect.objectContaining({ ...content, attemptKey: expect.any(String) })));
    await screen.findByRole('button', { name: 'Recover this attempt' });
    expect(screen.getByLabelText('Subject')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Recover this attempt' }));
    await waitFor(() => expect(sendInvoiceEmailAction).toHaveBeenCalledTimes(2));
    expect(recoverInvoiceEmailAction).not.toHaveBeenCalled();
    expect(vi.mocked(sendInvoiceEmailAction).mock.calls[1][2]).toEqual(vi.mocked(sendInvoiceEmailAction).mock.calls[0][2]);
  });

  it('reminders use the outstanding balance and supplied last accepted recipient', () => {
    open({ kind: 'reminder', recipientEmail: 'accounts@example.com' });
    expect(screen.getByLabelText('Recipient Email')).toHaveValue('accounts@example.com');
    expect((screen.getByLabelText('Message (Optional)') as HTMLTextAreaElement).value).toContain('60.00 EUR');
    expect(screen.queryByText('Request Client Acknowledgement')).not.toBeInTheDocument();
  });

  it('locks an unknown send and recovers its delivery ID instead of sending a fresh email', async () => {
    open({ delivery: { ...delivery, status: 'unknown', recoveryExpiresAt: '2099-09-27T10:00:00Z' } });
    expect(screen.getByLabelText('Subject')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Recover this attempt' }));
    await waitFor(() => expect(recoverInvoiceEmailAction).toHaveBeenCalledWith(2, 7, 9));
    expect(sendInvoiceEmailAction).not.toHaveBeenCalled();
  });

  it('requires explicit confirmation for an expired unknown send', async () => {
    open({ delivery: { ...delivery, status: 'unknown', recoveryExpiresAt: '2020-01-01T00:00:00Z' } });
    const button = screen.getByRole('button', { name: 'Send a new email' });
    expect(button).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /I understand the original/ }));
    await userEvent.click(button);
    await waitFor(() => expect(sendInvoiceEmailAction).toHaveBeenCalledWith(2, 7,
      expect.objectContaining({ confirmPossibleDuplicate: true, replacesDeliveryId: 9 })));
  });
});
