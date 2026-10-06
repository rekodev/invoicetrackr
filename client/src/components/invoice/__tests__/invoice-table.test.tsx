import type {
  InvoiceListItem,
  InvoiceWorkspaceResponse
} from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getInvoiceWorkspaceAction } from '@/lib/actions/invoice';
import { withIntl } from '@/test/with-intl';

import InvoiceTable from '../invoice-table';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));
vi.mock('@/api/invoice', () => ({ getIncomeJournalExport: vi.fn() }));
vi.mock('@/lib/actions/invoice', () => ({
  getInvoiceWorkspaceAction: vi.fn(),
  updateInvoiceStatusAction: vi.fn(),
  issueInvoiceAction: vi.fn(),
  deleteInvoiceAction: vi.fn(),
  createRecipientDetailsRequestAction: vi.fn(),
  sendInvoiceEmailAction: vi.fn(),
  recoverInvoiceEmailAction: vi.fn(),
  saveInvoicePaymentAction: vi.fn()
}));
vi.mock('@/lib/utils/download-invoice', () => ({ downloadInvoice: vi.fn() }));

const invoice = {
  id: 7,
  invoiceId: 'SF007',
  receiver: { name: 'Test Client' },
  totalAmount: '120.00',
  paidAmount: '40.00',
  outstandingAmount: '80.00',
  date: '2026-09-20',
  dueDate: '2026-10-20',
  lifecycleStatus: 'issued',
  status: 'pending'
} as InvoiceListItem;

describe('invoice list', () => {
  it('links a saved invoice to its workspace', () => {
    render(withIntl(<InvoiceTable invoices={[invoice]} userId={1} />));

    expect(screen.getByRole('link', { name: 'SF007' })).toHaveAttribute(
      'href',
      '/invoices/7'
    );
    expect(screen.getByRole('link', { name: 'View invoice' })).toHaveAttribute(
      'href',
      '/invoices/7'
    );
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Partially paid')).toBeInTheDocument();
    expect(screen.getByText('€120.00')).toBeInTheDocument();
    expect(screen.queryByText('Received: €40.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Remaining: €80.00')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Record payment' })
    ).not.toBeInTheDocument();
  });

  it('loads issued actions on demand and hides cancel when receipts exist', async () => {
    const data = {
      invoice,
      balance: { paidAmount: '40.00', outstandingAmount: '80.00' },
      payments: [{ id: 1 }],
      deliveries: [],
      canCopyPublicLink: true
    } as unknown as InvoiceWorkspaceResponse;
    vi.mocked(getInvoiceWorkspaceAction).mockResolvedValue({ ok: true, data });
    render(
      withIntl(<InvoiceTable invoices={[invoice]} userId={1} isEmailVerified />)
    );
    expect(
      screen.getByRole('button', { name: 'Download' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'More Actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Send invoice' })
    ).toBeInTheDocument();
    expect(getInvoiceWorkspaceAction).toHaveBeenCalledWith(1, 7);
    expect(
      screen.getByRole('menuitem', { name: 'Send reminder' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Copy public link' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Cancel invoice' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Edit draft' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Record payment' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Record payment' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Maximum amount: €80.00/)).toBeInTheDocument();
  });

  it('groups draft edit and delete below the regular actions and opens the existing issue dialog', async () => {
    const draft: InvoiceListItem = { ...invoice, lifecycleStatus: 'draft' };
    vi.mocked(getInvoiceWorkspaceAction).mockResolvedValue({
      ok: true,
      data: {
        invoice: draft,
        balance: { paidAmount: '0.00', outstandingAmount: '120.00' },
        payments: [],
        deliveries: [],
        canCopyPublicLink: false
      } as InvoiceWorkspaceResponse
    });
    render(withIntl(<InvoiceTable invoices={[draft]} userId={1} />));
    await userEvent.click(screen.getByRole('button', { name: 'More Actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Issue Invoice' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Edit draft' })
    ).toHaveAttribute('href', '/invoices/edit/7');
    expect(
      screen.getByRole('menuitem', { name: 'Delete draft' })
    ).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Send invoice' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Issue Invoice' })
    );
    expect(
      await screen.findByRole('dialog', { name: 'Issue Invoice' })
    ).toBeInTheDocument();
  });

  it('keeps legacy crypto drafts editable without offering issue or recipient completion', async () => {
    const draft: InvoiceListItem = {
      ...invoice,
      lifecycleStatus: 'draft',
      paymentMode: 'crypto' as const
    };
    vi.mocked(getInvoiceWorkspaceAction).mockResolvedValue({
      ok: true,
      data: {
        invoice: draft,
        balance: { paidAmount: '0.00', outstandingAmount: '120.00' },
        payments: [],
        deliveries: [],
        canCopyPublicLink: false
      } as InvoiceWorkspaceResponse
    });
    render(withIntl(<InvoiceTable invoices={[draft]} userId={1} />));
    await userEvent.click(screen.getByRole('button', { name: 'More Actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Edit draft' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Issue Invoice' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Request Recipient Details' })
    ).not.toBeInTheDocument();
  });

  it('disables email actions for an unverified sender', async () => {
    vi.mocked(getInvoiceWorkspaceAction).mockResolvedValue({
      ok: true,
      data: {
        invoice,
        balance: { paidAmount: '0.00', outstandingAmount: '120.00' },
        payments: [],
        deliveries: [],
        canCopyPublicLink: false
      } as InvoiceWorkspaceResponse
    });
    render(withIntl(<InvoiceTable invoices={[invoice]} userId={1} />));
    await userEvent.click(screen.getByRole('button', { name: 'More Actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Send invoice' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('menuitem', { name: 'Send reminder' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('menuitem', { name: 'Cancel invoice' })
    ).toBeInTheDocument();
  });

  it('filters unpaid invoices independently of the overdue condition', async () => {
    const unpaid = {
      ...invoice,
      id: 8,
      invoiceId: 'SF008',
      receiver: { ...invoice.receiver, name: 'Unpaid client' },
      paidAmount: '0.00',
      outstandingAmount: '120.00',
      dueDate: '2000-01-01'
    };
    const partial = { ...invoice, dueDate: '2000-01-01' };
    const zero = {
      ...invoice,
      id: 9,
      invoiceId: 'SF009',
      totalAmount: '0.00',
      paidAmount: '0.00',
      outstandingAmount: '0.00',
      dueDate: '2000-01-01'
    };
    render(
      withIntl(<InvoiceTable invoices={[partial, unpaid, zero]} userId={1} />)
    );
    await userEvent.click(screen.getByRole('button', { name: 'Overdue only' }));
    expect(
      screen.queryByRole('link', { name: 'SF009' })
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Status' }));
    await userEvent.click(
      screen.getByRole('menuitemradio', { name: 'Unpaid' })
    );
    expect(screen.getByRole('link', { name: 'SF008' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'SF007' })
    ).not.toBeInTheDocument();
  });
});
