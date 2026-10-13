import type {
  InvoiceListItem,
  InvoiceListQuery,
  InvoiceWorkspaceResponse
} from '@invoicetrackr/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getInvoiceWorkspaceAction } from '@/lib/actions/invoice';
import { withIntl } from '@/test/with-intl';

import InvoiceTable from '../invoice-table';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace })
}));
afterEach(() => mockReplace.mockClear());
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
  status: 'pending',
  paymentDates: ['2026-09-25']
} as InvoiceListItem;

const defaultQuery: InvoiceListQuery = {
  page: 1,
  pageSize: 10,
  sort: 'date',
  direction: 'descending'
};

const renderTable = ({
  invoices = [invoice],
  ...props
}: Partial<ComponentProps<typeof InvoiceTable>> = {}) =>
  render(
    withIntl(
      <InvoiceTable
        invoices={invoices}
        pagination={{ page: 1, pageSize: 10, total: invoices.length }}
        query={defaultQuery}
        userId={1}
        {...props}
      />
    )
  );

describe('invoice list', () => {
  it('links a saved invoice to its workspace', () => {
    renderTable();

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

  it('shows URL filters as chips and moves every filter change into the URL', async () => {
    renderTable({
      query: {
        ...defaultQuery,
        status: 'open',
        paidFrom: '2026-01-01',
        paidTo: '2026-12-31'
      }
    });

    expect(screen.getByText('Paid: Jan 1, 2026 – Dec 31, 2026')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Overdue only' }));
    expect(mockReplace).toHaveBeenLastCalledWith(
      '/invoices?status=open&paidFrom=2026-01-01&paidTo=2026-12-31&overdue=1',
      { scroll: false }
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Paid: Jan 1, 2026 – Dec 31, 2026 filter'
      })
    );
    expect(mockReplace).toHaveBeenLastCalledWith('/invoices?status=open', {
      scroll: false
    });

    await userEvent.click(screen.getByRole('button', { name: 'Status' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Unpaid' }));
    expect(mockReplace).toHaveBeenLastCalledWith(
      '/invoices?status=pending&paidFrom=2026-01-01&paidTo=2026-12-31',
      { scroll: false }
    );
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
    renderTable({ isEmailVerified: true });
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
    renderTable({ invoices: [draft] });
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
    renderTable({ invoices: [draft] });
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
    renderTable();
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

  it('pages and searches through the server, and shows the no-results state for filtered empty pages', async () => {
    const { unmount } = renderTable({
      pagination: { page: 1, pageSize: 10, total: 25 }
    });

    expect(screen.getByText('1 to 10 of 25 results')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(mockReplace).toHaveBeenLastCalledWith('/invoices?page=2', {
      scroll: false
    });

    await userEvent.type(screen.getByPlaceholderText('Search by invoice ID...'), ' SF ');
    await waitFor(() =>
      expect(mockReplace).toHaveBeenLastCalledWith('/invoices?q=SF', {
        scroll: false
      })
    );
    unmount();

    renderTable({
      invoices: [],
      query: { ...defaultQuery, q: 'missing' }
    });
    expect(screen.getByText('0 to 0 of 0 results')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'SF007' })).not.toBeInTheDocument();
  });
});
