import type { InvoiceBody } from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
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
  date: '2026-09-20',
  dueDate: '2026-10-20',
  lifecycleStatus: 'issued',
  status: 'pending'
} as InvoiceBody;

describe('invoice list', () => {
  it('links a saved invoice to its workspace', () => {
    render(withIntl(<InvoiceTable invoices={[invoice]} userId={1} />));

    expect(screen.getByRole('link', { name: 'SF007' })).toHaveAttribute(
      'href',
      '/invoices/7'
    );
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });
});
