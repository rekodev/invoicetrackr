import type { InvoiceWorkspaceResponse } from '@invoicetrackr/types';
import { render, screen } from '@testing-library/react';
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
  createRecipientDetailsRequestAction: vi.fn()
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
    expect(mockUseDynamicPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceLanguage: 'lt',
        currency: 'eur',
        invoiceData: data.invoice
      })
    );
  });
});
