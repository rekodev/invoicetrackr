import { ComponentProps, JSX } from 'react';
import { DEFAULT_CURRENCY, User } from '@invoicetrackr/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { withIntl } from '@/test/with-intl';

import MultiStepForm from '../multi-step-form';

const mockSignUpAction = vi.fn();
const mockPersonalInfoAction = vi.fn();
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    refresh: mockRouterRefresh
  })
}));

vi.mock('@/lib/actions', () => ({
  signInWithGoogleAction: vi.fn(),
  signUpAction: (...args: Array<unknown>) => mockSignUpAction(...args),
  updateUserAction: (...args: Array<unknown>) =>
    mockPersonalInfoAction(...args),
  updateSessionAction: vi.fn()
}));

describe('<MultiStepForm />', () => {
  let props: ComponentProps<typeof MultiStepForm>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  const existingUser: User = {
    id: 1,
    email: 'test@example.com',
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
    props = {
      existingUserData: existingUser
    };
    mockSignUpAction.mockClear();
    mockPersonalInfoAction.mockClear();
    mockRouterPush.mockClear();
    mockRouterReplace.mockClear();
    mockRouterRefresh.mockClear();
  });

  it('renders first step (sign up) by default', () => {
    props.existingUserData = undefined;
    renderHelper(<MultiStepForm {...props} />);

    expect(screen.getByTestId('sign-up-form')).toBeDefined();
  });

  it('renders personal information step when user data exists without personal info', () => {
    const userWithoutPersonalInfo: User = {
      ...existingUser,
      email: '',
      name: '',
      address: '',
      businessNumber: ''
    };

    renderHelper(<MultiStepForm existingUserData={userWithoutPersonalInfo} />);

    expect(
      screen.getByRole('heading', { name: 'Freelancer Profile' })
    ).toBeDefined();
  });

  it('keeps completed users on the freelancer profile step when rendered directly', () => {
    renderHelper(<MultiStepForm {...props} existingUserData={existingUser} />);

    expect(
      screen.getByRole('heading', { name: 'Freelancer Profile' })
    ).toBeDefined();
  });
});
