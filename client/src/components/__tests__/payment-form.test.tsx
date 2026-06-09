import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { User } from '@invoicetrackr/types';
import userEvent from '@testing-library/user-event';

import { withIntl } from '@/test/with-intl';

import PaymentForm from '../payment-form';

const mockCreateCheckoutSession = vi.fn();
const mockStartTrial = vi.fn();
const mockCreateBillingPortalSession = vi.fn();
const mockResumeSubscription = vi.fn();
const mockUpdateSessionAction = vi.fn();
const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh
  })
}));

vi.mock('@/api/payment', () => ({
  createCheckoutSession: (...args: Array<unknown>) =>
    mockCreateCheckoutSession(...args),
  startTrial: (...args: Array<unknown>) => mockStartTrial(...args),
  createBillingPortalSession: (...args: Array<unknown>) =>
    mockCreateBillingPortalSession(...args),
  resumeSubscription: (...args: Array<unknown>) =>
    mockResumeSubscription(...args)
}));

vi.mock('@/lib/actions', () => ({
  updateSessionAction: (...args: Array<unknown>) =>
    mockUpdateSessionAction(...args)
}));

const user: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  businessNumber: '123456789',
  address: 'Test Address',
  type: 'sender',
  selectedBankAccountId: 1,
  language: 'en',
  currency: 'eur',
  businessType: 'business',
  profilePictureUrl: ''
};

const errorResponse = {
  data: {
    errors: [],
    message: 'Unable to checkout',
    code: 'bad_request'
  }
};

describe('<PaymentForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders annual as the recommended default option', () => {
    render(withIntl(<PaymentForm user={user} />));

    expect(screen.getByRole('button', { name: /annual/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByText('Save 18%')).toBeInTheDocument();
    expect(screen.getByText('€49')).toBeInTheDocument();
  });

  it('starts checkout with the default annual interval', async () => {
    mockCreateCheckoutSession.mockResolvedValue(errorResponse);
    render(withIntl(<PaymentForm user={user} />));

    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(1, 'annual');
    });
  });

  it('starts checkout with the selected monthly interval', async () => {
    mockCreateCheckoutSession.mockResolvedValue(errorResponse);
    render(withIntl(<PaymentForm user={user} />));

    await userEvent.click(screen.getByRole('button', { name: /monthly/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(1, 'monthly');
    });
  });

  it('starts the trial with the selected monthly interval', async () => {
    mockStartTrial.mockResolvedValue({
      data: {
        billing: {
          onboardingCompletedAt: new Date().toISOString()
        }
      }
    });
    const onTrialStarted = vi.fn();

    render(
      withIntl(<PaymentForm user={user} onTrialStarted={onTrialStarted} />)
    );

    await userEvent.click(screen.getByRole('button', { name: /monthly/i }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Start Free Trial' })
    );

    await waitFor(() => {
      expect(mockStartTrial).toHaveBeenCalledWith(1, 'monthly');
      expect(onTrialStarted).toHaveBeenCalledTimes(1);
      expect(mockUpdateSessionAction).not.toHaveBeenCalled();
    });
  });

  it('refreshes the route after starting a trial outside onboarding', async () => {
    const onboardingCompletedAt = new Date().toISOString();
    mockStartTrial.mockResolvedValue({
      data: {
        billing: {
          onboardingCompletedAt,
          subscriptionStatus: 'trialing'
        }
      }
    });
    mockUpdateSessionAction.mockResolvedValue(undefined);

    render(withIntl(<PaymentForm user={user} />));

    await userEvent.click(
      screen.getByRole('button', { name: 'Start Free Trial' })
    );

    await waitFor(() => {
      expect(mockUpdateSessionAction).toHaveBeenCalledWith({
        newSession: {
          isOnboarded: true,
          onboardingCompletedAt,
          subscriptionStatus: 'trialing'
        }
      });
      expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
