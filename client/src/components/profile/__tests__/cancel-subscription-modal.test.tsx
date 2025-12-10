import { ComponentProps, JSX } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withIntl } from '@/test/with-intl';

import CancelSubscriptionModal from '../cancel-subscription-modal';

const { mockCancelStripeSubscription, mockUpdateSessionAction } = vi.hoisted(
  () => ({
    mockCancelStripeSubscription: vi.fn(),
    mockUpdateSessionAction: vi.fn()
  })
);

vi.mock('@/api/payment', () => ({
  cancelStripeSubscription: mockCancelStripeSubscription
}));

vi.mock('@/lib/actions', () => ({
  updateSessionAction: mockUpdateSessionAction
}));

describe('<CancelSubscriptionModal />', () => {
  let props: ComponentProps<typeof CancelSubscriptionModal>;
  const renderHelper = (component: JSX.Element) => render(withIntl(component));

  beforeEach(() => {
    props = {
      user: {
        id: '1',
        name: 'Test User',
        address: 'Test Address',
        businessNumber: '123456789',
        email: 'test@example.com',
        subscriptionStatus: 'active',
        businessType: 'business',
        currency: 'eur',
        language: 'en',
        preferredInvoiceLanguage: 'en',
        selectedBankAccountId: 1,
        stripeCustomerId: 'cus_12345',
        stripeSubscriptionId: 'sub_12345',
        isOnboarded: true,
        type: 'sender',
        vatNumber: 'VAT123456'
      },
      isOpen: true,
      onClose: vi.fn()
    };
  });

  it('renders correctly', () => {
    renderHelper(<CancelSubscriptionModal {...props} />);

    expect(screen.getByText('Cancel Subscription')).toBeDefined();
    expect(screen.getByText('Yes, cancel my subscription')).toBeDefined();
    expect(screen.getByText('Keep Subscription')).toBeDefined();
  });

  it('successfully cancels subscription', async () => {
    mockCancelStripeSubscription.mockResolvedValue({
      status: 200,
      data: { message: 'Subscription cancelled' }
    });

    renderHelper(<CancelSubscriptionModal {...props} />);

    await userEvent.click(screen.getByText('Yes, cancel my subscription'));

    expect(mockCancelStripeSubscription).toHaveBeenCalledWith(1);
    expect(mockUpdateSessionAction).toHaveBeenCalledWith({
      newSession: expect.objectContaining({
        id: '1',
        subscriptionStatus: 'canceled'
      }),
      redirectPath: expect.any(String)
    });
  });

  it('handles error when cancelling subscription fails', async () => {
    mockCancelStripeSubscription.mockResolvedValue({
      status: 400,
      data: { errors: [], message: 'Failed to cancel' }
    });

    renderHelper(<CancelSubscriptionModal {...props} />);

    await userEvent.click(screen.getByText('Yes, cancel my subscription'));

    expect(mockCancelStripeSubscription).toHaveBeenCalled();
    expect(mockUpdateSessionAction).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    renderHelper(<CancelSubscriptionModal {...props} />);

    await userEvent.click(screen.getByText('Keep Subscription'));

    expect(props.onClose).toHaveBeenCalled();
  });
});
