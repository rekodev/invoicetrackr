import type { InvoiceListItem } from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import InvoiceTable from '../invoice-table';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/api/invoice', () => ({ getIncomeJournalExport: vi.fn() }));

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
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Partially paid')).toBeInTheDocument();
    expect(screen.getByText('€120.00')).toBeInTheDocument();
    expect(screen.queryByText('Received: €40.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Remaining: €80.00')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument();
  });

  it('filters unpaid invoices independently of the overdue condition', async () => {
    const unpaid = { ...invoice, id: 8, invoiceId: 'SF008', receiver: { ...invoice.receiver, name: 'Unpaid client' }, paidAmount: '0.00', outstandingAmount: '120.00', dueDate: '2000-01-01' };
    const partial = { ...invoice, dueDate: '2000-01-01' };
    const zero = { ...invoice, id: 9, invoiceId: 'SF009', totalAmount: '0.00', paidAmount: '0.00', outstandingAmount: '0.00', dueDate: '2000-01-01' };
    render(withIntl(<InvoiceTable invoices={[partial, unpaid, zero]} userId={1} />));
    await userEvent.click(screen.getByRole('button', { name: 'Overdue only' }));
    expect(screen.queryByRole('link', { name: 'SF009' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Status' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Unpaid' }));
    expect(screen.getByRole('link', { name: 'SF008' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'SF007' })).not.toBeInTheDocument();
  });
});
