import { BankAccount, User } from '@invoicetrackr/types';
import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withIntl } from '@/test/with-intl';

import MultiStepForm from '../multi-step-form';

const mockSignUpAction = vi.fn();
const mockPersonalInfoAction = vi.fn();
const mockBankAccountAction = vi.fn();

vi.mock('@/lib/actions', () => ({
  signUpAction: (...args: Array<unknown>) => mockSignUpAction(...args),
  updateUserAction: (...args: Array<unknown>) =>
    mockPersonalInfoAction(...args),
  createBankingInformationAction: (...args: Array<unknown>) =>
    mockBankAccountAction(...args),
  updateBankingInformationAction: (...args: Array<unknown>) =>
    mockBankAccountAction(...args)
}));

vi.mock('../payment-form', () => ({
  default: ({ user }: { user?: User }) => (
    <div data-testid="payment-form">Payment Form for {user?.email}</div>
  )
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
    stripeSubscriptionId: 'sub_12345',
    stripeCustomerId: 'cus_12345',
    selectedBankAccountId: 1,
    language: 'en',
    currency: 'usd',
    businessType: 'business',
    profilePictureUrl: ''
  };

  const userBankingInformation: BankAccount = {
    name: 'Test Bank',
    accountNumber: 'LT123456789012345678',
    code: 'TESTLT2X'
  };

  beforeEach(() => {
    props = {
      existingUserData: existingUser,
      existingBankingInformation: userBankingInformation
    };
    mockSignUpAction.mockClear();
    mockPersonalInfoAction.mockClear();
    mockBankAccountAction.mockClear();
  });

  it('renders first step (sign up) by default', () => {
    props.existingBankingInformation = undefined;
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
      screen.getByTestId('personal-information-form-heading')
    ).toBeDefined();
  });

  it('renders banking step when user has personal info but no banking info', () => {
    renderHelper(<MultiStepForm {...props} existingUserData={existingUser} />);

    expect(screen.getByText(/Banking Information/i)).toBeDefined();
  });

  it('renders payment step when user has all information except subscription', () => {
    renderHelper(<MultiStepForm {...props} />);

    expect(screen.findByTestId('payment-form')).toBeDefined();
  });

  it('allows navigation between steps when user exists', async () => {
    renderHelper(<MultiStepForm {...props} />);

    const steps = screen.getAllByText(/Personal Information/i);
    await userEvent.click(steps[0]);

    expect(
      screen.getByTestId('personal-information-form-heading')
    ).toBeDefined();
  });
});
