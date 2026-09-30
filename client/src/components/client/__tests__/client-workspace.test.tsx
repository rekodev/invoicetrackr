import type { ClientWorkspaceResponse } from '@invoicetrackr/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import ClientWorkspace from '../client-workspace';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('../archive-client-modal', () => ({ default: () => null }));
vi.mock('../client-form-dialog', () => ({ default: () => null }));

const client = {
  id: 3,
  name: 'Acme UAB',
  type: 'receiver' as const,
  businessType: 'business' as const,
  businessNumber: '123456789',
  vatNumber: 'LT123456789',
  address: 'Vilnius',
  email: 'billing@acme.lt',
  archivedAt: null
};

const data: ClientWorkspaceResponse = {
  client,
  totals: { invoicedAmount: '100.00', paidAmount: '40.00', outstandingAmount: '60.00' },
  invoices: [
    { id: 8, invoiceId: 'SF008', date: '2026-09-20', dueDate: '2026-10-20',
      lifecycleStatus: 'issued', status: 'pending', totalAmount: '100.00',
      paidAmount: '40.00', outstandingAmount: '60.00' },
    { id: 7, invoiceId: null, date: '2026-09-19', dueDate: '2026-10-19',
      lifecycleStatus: 'draft', status: 'pending', totalAmount: '25.00',
      paidAmount: null, outstandingAmount: null }
  ]
};

describe('client workspace', () => {
  it('shows real balances, draft dashes, and invoice links', () => {
    render(withIntl(<ClientWorkspace userId={1} data={data} />));
    expect(screen.queryByRole('link', { name: 'All clients' })).not.toBeInTheDocument();
    expect(screen.getByText('Business Number')).toBeInTheDocument();
    expect(screen.getByText('VAT Number')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getAllByText('€100.00')).toHaveLength(2);
    expect(screen.getAllByText('€40.00')).toHaveLength(2);
    expect(screen.getAllByText('€60.00')).toHaveLength(2);
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Create Invoice' })).toHaveAttribute('href', '/invoices/new?clientId=3');
    expect(screen.getAllByRole('link', { name: 'View' })[0]).toHaveAttribute('href', '/invoices/8');
  });

  it('leads an empty workspace to a prefilled first invoice', () => {
    render(withIntl(<ClientWorkspace userId={1} data={{ ...data, invoices: [] }} />));
    expect(screen.getByText('No invoices for this client yet')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Create Invoice' })[1]).toHaveAttribute('href', '/invoices/new?clientId=3');
  });

  it('copies a labeled block of current client details', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(withIntl(<ClientWorkspace userId={1} data={data} />));
    fireEvent.click(screen.getByRole('button', { name: 'Copy Details' }));
    expect(writeText).toHaveBeenCalledWith(
      'Name: Acme UAB\nBusiness Number: 123456789\nVAT Number: LT123456789\nAddress: Vilnius\nEmail: billing@acme.lt'
    );
  });
});
