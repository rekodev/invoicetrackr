import { DEFAULT_CURRENCY } from '@invoicetrackr/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsConsentContext } from '@/lib/analytics/consent-context';
import { withIntl } from '@/test/with-intl';

import InvoiceTable from '../invoice-table';

const { mockUpdateInvoiceStatusAction, mockUseDynamicPdf } = vi.hoisted(() => ({
  mockUpdateInvoiceStatusAction: vi.fn(),
  mockUseDynamicPdf: vi.fn((_settings: any) => ({
    pdfDocument: null,
    pdfUrl: null,
    isPdfDocumentLoading: false
  }))
}));

vi.mock('@/lib/actions', () => ({
  updateInvoiceStatusAction: mockUpdateInvoiceStatusAction
}));
vi.mock('@/lib/hooks/pdf/use-dynamic-pdf', () => ({
  default: mockUseDynamicPdf
}));
vi.mock('@react-pdf/renderer', () => ({
  BlobProvider: ({ children }: any) =>
    typeof children === 'function'
      ? children({ url: '', blob: null, loading: false, error: null })
      : null,
  PDFDownloadLink: ({ children }: any) =>
    typeof children === 'function'
      ? children({ url: '', loading: false, error: null })
      : null,
  StyleSheet: {
    create: (styles: any) => styles
  },
  Font: {
    register: (_: any) => {}
  },
  usePDF: () => [{ url: '', loading: false, error: null }, vi.fn()]
}));
vi.mock('next/navigation', () =>
  vi.importActual('next-router-mock/navigation')
);

describe('<InvoiceTable/>', () => {
  let props: ComponentProps<typeof InvoiceTable>;
  const renderHelper = (component: JSX.Element) =>
    render(
      withIntl(
        <AnalyticsConsentContext.Provider
          value={{ consentStatus: 'declined', setConsentStatus: vi.fn() }}
        >
          {component}
        </AnalyticsConsentContext.Provider>
      )
    );

  beforeEach(() => {
    mockRouter.push('/invoices');
    mockUseDynamicPdf.mockClear();
    props = {
      userId: 1,
      currency: DEFAULT_CURRENCY,
      invoices: [
        {
          id: 1,
          invoiceId: 'INV001',
          bankingInformation: {
            id: 4,
            code: 'HSBCLT2D',
            name: 'Test Bank',
            accountNumber: '12345678'
          },
          sender: {
            id: 2,
            name: 'Test Sender',
            address: '456 Sender St',
            email: '',
            businessNumber: '987654321',
            businessType: 'individual',
            type: 'sender'
          },
          receiver: {
            id: 3,
            name: 'Test Receiver',
            address: '123 Test St',
            email: '',
            businessNumber: '123456789',
            businessType: 'business',
            type: 'receiver'
          },
          totalAmount: '100.00',
          date: '2023-01-01',
          serviceDate: '2023-01-01',
          notes: null,
          dueDate: '2023-01-10',
          status: 'pending',
          lifecycleStatus: 'issued',
          currency: 'eur',
          documentLanguage: 'lt',
          paymentMode: 'manual',
          services: [
            {
              id: 5,
              position: 0,
              amount: 100,
              unit: 'hours',
              description: 'Test Service',
              quantity: 1
            }
          ]
        }
      ],
      language: 'en',
      userPreferredInvoiceLanguage: 'en',
      isEmailVerified: true
    };
  });

  it('renders correctly', () => {
    renderHelper(<InvoiceTable {...props} />);

    expect(screen.getByText('INV001')).toBeDefined();
    expect(screen.getByText('Test Receiver')).toBeDefined();
    expect(screen.getByText('100.00')).toBeDefined();
    expect(screen.getByText('2023-01-01')).toBeDefined();
    expect(screen.getByText('pending')).toBeDefined();
  });

  it('displays past due indicator when invoice is past due', () => {
    vi.setSystemTime(new Date('2025-12-01'));
    props.invoices[0].dueDate = '2025-11-16';
    props.invoices[0].status = 'pending';
    renderHelper(<InvoiceTable {...props} />);

    expect(screen.getByTestId('invoice-past-due-indicator')).toHaveTextContent(
      '15d past due'
    );
  });

  it('opens an issued invoice in its saved document language', async () => {
    const user = userEvent.setup();
    renderHelper(<InvoiceTable {...props} />);

    await user.click(screen.getByRole('button', { name: 'Details' }));

    await waitFor(() =>
      expect(
        mockUseDynamicPdf.mock.calls.some(
          ([settings]) =>
            settings.invoiceData?.id === 1 &&
            settings.invoiceLanguage === 'lt' &&
            settings.currency === 'eur'
        )
      ).toBe(true)
    );
  });

  it('builds the email attachment with saved document settings', async () => {
    const user = userEvent.setup();
    renderHelper(<InvoiceTable {...props} />);

    await user.click(
      screen.getByRole('button', { name: 'Send Invoice Email' })
    );

    await waitFor(() =>
      expect(
        mockUseDynamicPdf.mock.calls.some(
          ([settings]) =>
            settings.invoiceData?.id === 1 &&
            settings.invoiceLanguage === 'lt' &&
            settings.currency === 'eur'
        )
      ).toBe(true)
    );
  });

  it('keeps issuing and emailing as separate draft actions', () => {
    props.invoices[0] = {
      ...props.invoices[0],
      lifecycleStatus: 'draft',
      currency: null,
      documentLanguage: null
    };

    renderHelper(<InvoiceTable {...props} />);

    expect(
      screen.queryByRole('button', { name: 'Send Invoice Email' })
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Issue Invoice' })
    ).toBeInTheDocument();
  });
});
