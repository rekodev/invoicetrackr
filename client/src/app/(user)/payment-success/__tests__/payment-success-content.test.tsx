import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { withIntl } from '@/test/with-intl';

import PaymentSuccessContent from '../payment-success-content';

describe('<PaymentSuccessContent />', () => {
  it('links paid subscription success back to billing settings', () => {
    render(withIntl(<PaymentSuccessContent isTrial={false} />));

    expect(
      screen.getByRole('link', { name: /manage subscription/i })
    ).toHaveAttribute('href', '/profile/billing');
  });

  it('keeps trial success linked to renewal', () => {
    render(withIntl(<PaymentSuccessContent isTrial />));

    expect(
      screen.getByRole('link', {
        name: /upgrade early and lock in the price/i
      })
    ).toHaveAttribute('href', '/renew-subscription');
  });
});
