import { DEFAULT_CURRENCY, type User } from '@invoicetrackr/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ComponentProps, type JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DASHBOARD_PAGE } from '@/lib/constants/pages';
import { withIntl } from '@/test/with-intl';

import MultiStepForm from '../multi-step-form';

const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh
  })
}));

vi.mock('@/lib/actions', () => ({
  signInWithGoogleAction: vi.fn(),
  signUpAction: vi.fn()
}));

vi.mock('../onboarding/freelancer-details-step', () => ({
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button type="button" onClick={onSuccess}>
      Save freelancer details
    </button>
  )
}));

vi.mock('../onboarding/invoice-defaults-step', () => ({
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button type="button" onClick={onSuccess}>
      Finish setup
    </button>
  )
}));

vi.mock('../profile/bank-account-form', () => ({
  default: ({
    onSkip,
    onSuccess
  }: {
    onSkip: () => void;
    onSuccess: () => void;
  }) => (
    <div>
      <button type="button" onClick={onSkip}>
        Skip for now
      </button>
      <button type="button" onClick={onSuccess}>
        Add bank account
      </button>
    </div>
  )
}));

describe('<MultiStepForm />', () => {
  let props: ComponentProps<typeof MultiStepForm>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  const existingUser: User = {
    id: 1,
    email: 'test@example.com',
    invoiceEmail: 'invoices@example.com',
    name: 'Test User',
    businessNumber: '123456789',
    address: 'Test Address',
    type: 'sender',
    selectedBankAccountId: 1,
    language: 'en',
    preferredInvoiceLanguage: 'en',
    isVatPayer: false,
    defaultInvoiceVatMode: 'no_vat',
    defaultInvoiceSeries: 'SF',
    defaultPaymentTermsDays: 30,
    currency: DEFAULT_CURRENCY,
    businessType: 'individual',
    profilePictureUrl: ''
  };

  beforeEach(() => {
    props = { existingUserData: existingUser };
  });

  it('renders the standalone sign-up form before authentication', () => {
    renderHelper(<MultiStepForm />);

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
  });

  it('restores an incomplete profile to freelancer details', () => {
    renderHelper(
      <MultiStepForm
        existingUserData={{
          ...existingUser,
          name: '',
          selectedBankAccountId: null
        }}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Freelancer details' })
    ).toBeInTheDocument();
  });

  it('restores a complete profile without banking to the optional bank step', () => {
    renderHelper(
      <MultiStepForm
        existingUserData={{ ...existingUser, selectedBankAccountId: null }}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Bank account' })
    ).toBeInTheDocument();
  });

  it('restores a user with a selected bank account to invoice defaults', () => {
    renderHelper(<MultiStepForm {...props} />);

    expect(
      screen.getByRole('heading', { name: 'Invoice defaults' })
    ).toBeInTheDocument();
  });

  it('advances only after the freelancer step reports a persisted save', () => {
    renderHelper(
      <MultiStepForm
        existingUserData={{
          ...existingUser,
          name: '',
          selectedBankAccountId: null
        }}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Save freelancer details' })
    );

    expect(
      screen.getByRole('heading', { name: 'Bank account' })
    ).toBeInTheDocument();
  });

  it('allows the optional bank step to be skipped', () => {
    renderHelper(
      <MultiStepForm
        existingUserData={{ ...existingUser, selectedBankAccountId: null }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));

    expect(
      screen.getByRole('heading', { name: 'Invoice defaults' })
    ).toBeInTheDocument();
  });

  it('advances after a bank account is persisted and selected', () => {
    renderHelper(
      <MultiStepForm
        existingUserData={{ ...existingUser, selectedBankAccountId: null }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add bank account' }));

    expect(
      screen.getByRole('heading', { name: 'Invoice defaults' })
    ).toBeInTheDocument();
  });

  it('refreshes the completed session and redirects to the dashboard', () => {
    renderHelper(<MultiStepForm {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));

    expect(mockRouterRefresh).toHaveBeenCalledOnce();
    expect(mockRouterPush).toHaveBeenCalledWith(DASHBOARD_PAGE);
  });
});
