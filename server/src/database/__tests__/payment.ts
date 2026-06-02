import { describe, expect, it } from 'vitest';

import { hasPaidAccess } from '../payment';

describe('hasPaidAccess', () => {
  it.each(['active', 'trialing'] as const)(
    'allows %s subscriptions',
    (subscriptionStatus) => {
      expect(
        hasPaidAccess({ subscriptionStatus, subscriptionGraceEndsAt: null })
      ).toBe(true);
    }
  );

  it('allows past due subscriptions during the grace period', () => {
    expect(
      hasPaidAccess({
        subscriptionStatus: 'past_due',
        subscriptionGraceEndsAt: new Date(Date.now() + 60_000).toISOString()
      })
    ).toBe(true);
  });

  it('blocks subscriptions after the grace period', () => {
    expect(
      hasPaidAccess({
        subscriptionStatus: 'past_due',
        subscriptionGraceEndsAt: new Date(Date.now() - 60_000).toISOString()
      })
    ).toBe(false);
  });

  it('blocks inactive subscriptions', () => {
    expect(
      hasPaidAccess({
        subscriptionStatus: 'canceled',
        subscriptionGraceEndsAt: null
      })
    ).toBe(false);
  });
});
