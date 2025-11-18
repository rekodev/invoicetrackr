import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import mockRouter from 'next-router-mock';

import InvoiceTable from '../invoice-table';
import { withIntl } from '@/test/with-intl';

const { mockUpdateInvoiceStatusAction } = vi.hoisted(() => ({
  mockUpdateInvoiceStatusAction: vi.fn()
}));

vi.mock('@/lib/actions', () => ({
  updateInvoiceStatusAction: mockUpdateInvoiceStatusAction
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
  }
}));
vi.mock('next/navigation', () =>
  vi.importActual('next-router-mock/navigation')
);

describe('<InvoiceTable/>', () => {
  let props: ComponentProps<typeof InvoiceTable>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    mockRouter.push('/invoices');
    props = {
      userId: 1,
      currency: 'eur',
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
          dueDate: '2023-01-10',
          status: 'pending',
          services: [
            {
              id: 5,
              amount: 100,
              unit: 'hours',
              description: 'Test Service',
              quantity: 1
            }
          ]
        }
      ],
      language: 'en'
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
});
