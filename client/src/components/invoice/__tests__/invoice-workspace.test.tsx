import type { InvoiceWorkspaceResponse } from '@invoicetrackr/types';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AnalyticsConsentContext } from '@/lib/analytics/consent-context';
import { withIntl } from '@/test/with-intl';

import InvoiceWorkspace from '../invoice-workspace';

const { mockUseDynamicPdf } = vi.hoisted(() => ({
  mockUseDynamicPdf: vi.fn(() => ({
    pdfDocument: null,
    pdfUrl: null,
    isPdfDocumentLoading: false
  }))
}));

vi.mock('@/lib/hooks/pdf/use-dynamic-pdf', () => ({
  default: mockUseDynamicPdf
}));
vi.mock('@/api/invoice', () => ({
  sendInvoiceEmail: vi.fn(),
  regeneratePublicInvoiceLink: vi.fn()
}));
vi.mock('@/lib/actions/invoice', () => ({
  deleteInvoiceAction: vi.fn(),
  removeInvoicePaymentAction: vi.fn(),
  saveInvoicePaymentAction: vi.fn(),
  updateInvoiceStatusAction: vi.fn(),
  issueInvoiceAction: vi.fn(),
  createRecipientDetailsRequestAction: vi.fn(),
  sendInvoiceEmailAction: vi.fn(),
  recoverInvoiceEmailAction: vi.fn()
}));
vi.mock('@/components/pdf/pdf-viewer-wrapper', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() })
}));

const data = {
  invoice: {
    id: 7,
    invoiceId: 'SF007',
    receiver: { name: 'Test Client' },
    totalAmount: '100.00',
    dueDate: '2026-10-20',
    status: 'pending',
    lifecycleStatus: 'issued',
    currency: 'eur',
    documentLanguage: 'lt',
    senderSignature: null,
    receiverSignature: null
  },
  balance: { paidAmount: '40.00', outstandingAmount: '60.00' },
  payments: [
    {
      id: 3,
      paymentDate: '2026-09-20',
      amount: '40.00',
      bankReference: null,
      notes: null,
      createdAt: '2026-09-20T10:00:00.000Z'
    }
  ],
  deliveries: [],
  canCopyPublicLink: false
} as unknown as InvoiceWorkspaceResponse;

describe('invoice workspace', () => {
  it('shows real partial balance and builds the PDF in the saved language', () => {
    render(
      withIntl(
        <AnalyticsConsentContext.Provider
          value={{ consentStatus: 'declined', setConsentStatus: vi.fn() }}
        >
          <InvoiceWorkspace
            userId={1}
            data={data}
            isEmailVerified
            preferredLanguage="en"
          />
        </AnalyticsConsentContext.Provider>
      )
    );

    expect(screen.getByText('Partially paid')).toBeInTheDocument();
    expect(screen.getAllByText('€40.00')).toHaveLength(2);
    expect(screen.getByText('€60.00')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Payments' })).getByRole('button', { name: 'Record payment' })).toBeInTheDocument();
    expect(screen.getByText('1 payment')).toBeInTheDocument();
    expect(mockUseDynamicPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceLanguage: 'lt',
        currency: 'eur',
        invoiceData: data.invoice
      })
    );
  });

  it('keeps payment recording in the empty payment section of an issued invoice', () => {
    render(withIntl(
      <AnalyticsConsentContext.Provider value={{ consentStatus: 'declined', setConsentStatus: vi.fn() }}>
        <InvoiceWorkspace userId={1} data={{ ...data, payments: [],
          balance: { paidAmount: '0.00', outstandingAmount: '100.00' }
        }} isEmailVerified preferredLanguage="en" />
      </AnalyticsConsentContext.Provider>
    ));
    const section = within(screen.getByRole('region', { name: 'Payments' }));
    expect(section.getByText('0 payments')).toBeInTheDocument();
    expect(section.getByText('No payments recorded yet.')).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Record payment' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Record payment' })).toHaveLength(1);
  });

  it('shows no payment due for a zero-total invoice without a paid date or payment action', () => {
    render(withIntl(
      <AnalyticsConsentContext.Provider value={{ consentStatus: 'declined', setConsentStatus: vi.fn() }}>
        <InvoiceWorkspace userId={1} data={{ ...data,
          invoice: { ...data.invoice, totalAmount: '0.00', dueDate: '2000-01-01' },
          balance: { paidAmount: '0.00', outstandingAmount: '0.00' }, payments: []
        }} isEmailVerified preferredLanguage="en" />
      </AnalyticsConsentContext.Provider>
    ));
    expect(screen.getByText('No payment due')).toBeInTheDocument();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Fully paid on/)).not.toBeInTheDocument();
  });

  it('requires replacing legacy crypto instructions before issuing a draft', () => {
    render(withIntl(
      <AnalyticsConsentContext.Provider value={{ consentStatus: 'declined', setConsentStatus: vi.fn() }}>
        <InvoiceWorkspace userId={1} data={{ ...data,
          invoice: { ...data.invoice, lifecycleStatus: 'draft', paymentMode: 'crypto' },
          payments: []
        }} isEmailVerified preferredLanguage="en" />
      </AnalyticsConsentContext.Provider>
    ));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit draft' })).toHaveAttribute('href', '/invoices/edit/7');
    expect(screen.queryByRole('button', { name: 'Issue Invoice' })).not.toBeInTheDocument();
  });
});
