import type { CompanyLookupResult, User } from '@invoicetrackr/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { withIntl } from '@/test/with-intl';

import InvoiceForm from '../invoice-form';

vi.mock('@/lib/hooks/invoice/use-invoice-form-submission-handler', () => ({
  default: () => ({ onSubmit: vi.fn(), redirectToInvoicesPage: vi.fn() })
}));
vi.mock('@/lib/hooks/use-unsaved-changes-guard', () => ({
  default: () => ({ confirmNavigation: vi.fn(), disableGuard: vi.fn() })
}));
vi.mock('@/components/company-lookup/company-lookup-panel', () => ({
  default: ({
    value,
    label,
    onInputChange,
    onApply
  }: {
    value: string;
    label: string;
    onInputChange: (_value: string) => void;
    onApply: (_result: CompanyLookupResult) => void;
  }) => (
    <>
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(event) => onInputChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() =>
          onApply({
            companyCode: '987654321',
            legalName: 'VMI Invoice Client UAB',
            vatNumber: null,
            registeredAddress: null,
            source: {
              provider: 'vmi',
              label: 'VMI open data via data.gov.lt — CC BY 4.0',
              url: 'https://data.gov.lt/datasets/607/?resource_version=940'
            }
          })
        }
      >
        Apply invoice VMI fixture
      </button>
    </>
  )
}));
vi.mock('../invoice-services-table', () => ({ default: () => null }));
vi.mock('../invoice-form-receiver-modal', () => ({ default: () => null }));
vi.mock('../payment-method-dialog', () => ({ default: () => null }));
vi.mock('../invoice-form-preview', () => ({ default: () => null }));
vi.mock('../../signature-pad', () => ({ default: () => null }));

const user = {
  id: 1,
  type: 'sender',
  name: 'Test Sender',
  businessType: 'individual',
  businessNumber: 'IV-1',
  vatNumber: null,
  address: 'Sender address',
  email: 'sender@example.com',
  invoiceEmail: 'invoice@example.com',
  phone: null,
  emailVerifiedAt: '2026-09-01T00:00:00.000Z',
  signature: '',
  selectedBankAccountId: 1,
  profilePictureUrl: '',
  currency: 'eur',
  language: 'en',
  preferredInvoiceLanguage: 'en',
  isVatPayer: true,
  defaultInvoiceVatMode: 'standard_21',
  defaultInvoiceSeries: 'SF',
  defaultPaymentTermsDays: 30,
  defaultInvoiceIncludeLogo: false,
  onboardingCompletedAt: '2026-09-01T00:00:00.000Z',
  analyticsConsentStatus: null,
  analyticsConsentUpdatedAt: null
} satisfies User;

describe('invoice company lookup', () => {
  it('updates only recipient legal fields, clears missing data, and preserves email without saving a client', () => {
    render(
      withIntl(
        <InvoiceForm
          user={user}
          clients={[]}
          bankingInformationEntries={[
            {
              id: 1,
              name: 'Bank',
              code: 'HABALT22',
              accountNumber: 'LT121000011101001000'
            }
          ]}
          cryptoWallets={[]}
          currency="eur"
        />
      )
    );

    fireEvent.change(screen.getByLabelText("Receiver's Email"), {
      target: { value: 'billing@example.com' }
    });
    fireEvent.change(screen.getByLabelText("Receiver's Address"), {
      target: { value: 'Old address' }
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Apply invoice VMI fixture' })
    );

    expect(screen.getByLabelText("Receiver's Name")).toHaveValue(
      'VMI Invoice Client UAB'
    );
    expect(screen.getByLabelText("Receiver's Company Code")).toHaveValue(
      '987654321'
    );
    expect(screen.getByLabelText("Receiver's VAT Number")).toHaveValue('');
    expect(screen.getByLabelText("Receiver's Address")).toHaveValue('');
    expect(screen.getByLabelText("Receiver's Email")).toHaveValue(
      'billing@example.com'
    );
    expect(
      screen.queryByText(/Enter the registered address manually/)
    ).not.toBeInTheDocument();
  });
});
