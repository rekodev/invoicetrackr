import { beforeEach, describe, expect, it, vi } from 'vitest';
import { billingIntervalRequestSchema } from '@invoicetrackr/types';

import * as paymentDb from '../../database/payment';
import * as userDb from '../../database/user';
import {
  consumePaymentSuccess,
  createBillingPortalSession,
  createCheckoutSession,
  getBillingStatus,
  startTrial
} from '../payment';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  mockStripeCheckoutSessionCreate,
  mockStripeCheckoutSessionList,
  mockStripeCheckoutSessionRetrieve,
  mockStripeCustomerCreate,
  mockStripeCustomerRetrieve,
  mockStripeInvoicesList,
  mockStripePaymentMethodRetrieve,
  mockStripePaymentMethodsList,
  mockStripePortalSessionCreate,
  mockStripePriceRetrieve,
  mockStripeSubscriptionCreate,
  mockStripeSubscriptionList,
  mockStripeSubscriptionRetrieve,
  mockStripeSubscriptionSearch
} from '../../test/setup';
import { userFactory } from '../../test/factories/user';

vi.mock('../../database/payment');
vi.mock('../../database/user');

const eligibleBilling = {
  subscriptionStatus: null,
  onboardingCompletedAt: new Date().toISOString(),
  trialStartedAt: null,
  trialEndsAt: null,
  subscriptionGraceEndsAt: null,
  subscriptionCurrentPeriodEndsAt: null,
  subscriptionCancelAt: null,
  paymentSuccessPending: false,
  hasPaidAccess: false
};

const mockSubscription = {
  id: 'sub_mock',
  status: 'trialing',
  trial_start: 1_750_000_000,
  trial_end: 1_750_604_800,
  cancel_at_period_end: false,
  cancel_at: null,
  items: {
    data: [
      {
        price: {
          id: 'price_annual',
          unit_amount: 4900,
          currency: 'eur',
          recurring: {
            interval: 'year',
            interval_count: 1
          }
        },
        current_period_end: 1_750_604_800
      }
    ]
  }
};

const createPaymentTestApp = async () =>
  createTestApp((app) => {
    app.post(
      '/api/:userId/billing/start-trial',
      {
        schema: { body: billingIntervalRequestSchema.optional() },
        preHandler: mockAuthMiddleware
      },
      startTrial
    );
    app.post(
      '/api/:userId/billing/checkout-session',
      {
        schema: { body: billingIntervalRequestSchema.optional() },
        preHandler: mockAuthMiddleware
      },
      createCheckoutSession
    );
    app.get(
      '/api/:userId/billing',
      {
        preHandler: mockAuthMiddleware
      },
      getBillingStatus
    );
    app.post(
      '/api/:userId/billing/portal-session',
      {
        preHandler: mockAuthMiddleware
      },
      createBillingPortalSession
    );
    app.post(
      '/api/:userId/billing/consume-payment-success',
      {
        preHandler: mockAuthMiddleware
      },
      consumePaymentSuccess
    );
  });

describe('Payment Controller', () => {
  beforeEach(() => {
    process.env.APP_BASE_URL = 'http://localhost:3000';
    process.env.STRIPE_EUR_PRICE = 'price_legacy_monthly';
    process.env.STRIPE_EUR_MONTHLY_PRICE = 'price_monthly';
    process.env.STRIPE_EUR_ANNUAL_PRICE = 'price_annual';

    vi.mocked(paymentDb.getBillingStatusFromDb).mockResolvedValue(
      eligibleBilling
    );
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: '2',
      stripeSubscriptionId: '3',
      userId: 4
    });
    vi.mocked(paymentDb.upsertStripeAccountInDb).mockResolvedValue(1);
    vi.mocked(paymentDb.updateStripeSubscriptionForUserInDb).mockResolvedValue(
      1
    );
    vi.mocked(paymentDb.updateBillingStatusInDb).mockResolvedValue(1);
    vi.mocked(userDb.getUserFromDb).mockResolvedValue(
      userFactory.build({ id: 1 })
    );
    mockStripeCustomerCreate.mockResolvedValue({ id: 'cus_mock' });
    mockStripeSubscriptionCreate.mockResolvedValue(mockSubscription);
    mockStripeCheckoutSessionCreate.mockResolvedValue({
      url: 'https://checkout.stripe.test/session'
    });
    mockStripeCheckoutSessionRetrieve.mockResolvedValue({
      id: 'cs_mock',
      status: 'complete',
      customer: 'cus_mock',
      subscription: 'sub_mock'
    });
    mockStripeCheckoutSessionList.mockResolvedValue({
      data: []
    });
    mockStripePortalSessionCreate.mockResolvedValue({
      url: 'https://billing.stripe.test/session'
    });
    mockStripeCustomerRetrieve.mockResolvedValue({
      id: 'cus_mock',
      deleted: false,
      name: 'Test Customer',
      email: 'billing@example.com',
      invoice_settings: {
        default_payment_method: 'pm_default'
      }
    });
    mockStripePaymentMethodRetrieve.mockResolvedValue({
      id: 'pm_default',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2030
      }
    });
    mockStripePaymentMethodsList.mockResolvedValue({
      data: [
        {
          id: 'pm_mock',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2030
          }
        }
      ]
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue(mockSubscription);
    mockStripeSubscriptionList.mockResolvedValue({
      data: [mockSubscription]
    });
    mockStripeSubscriptionSearch.mockResolvedValue({
      data: []
    });
    mockStripeInvoicesList.mockResolvedValue({
      data: []
    });
    mockStripePriceRetrieve.mockResolvedValue({
      id: 'price_annual',
      unit_amount: 4900,
      currency: 'eur',
      recurring: {
        interval: 'year',
        interval_count: 1
      }
    });
  });

  it('creates monthly checkout sessions with the monthly Stripe price', async () => {
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/checkout-session',
      payload: { interval: 'monthly' }
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_monthly', quantity: 1 }],
        metadata: { userId: '1' },
        subscription_data: {
          metadata: { userId: '1' }
        }
      })
    );

    await app.close();
  });

  it('creates annual checkout sessions with the annual Stripe price', async () => {
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/checkout-session',
      payload: { interval: 'annual' }
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_annual', quantity: 1 }],
        metadata: { userId: '1' },
        subscription_data: {
          metadata: { userId: '1' }
        }
      })
    );

    await app.close();
  });

  it('creates monthly trials with the monthly Stripe price', async () => {
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/start-trial',
      payload: { interval: 'monthly' }
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeSubscriptionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ price: 'price_monthly' }]
      })
    );

    await app.close();
  });

  it('creates annual trials with the annual Stripe price', async () => {
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/start-trial',
      payload: { interval: 'annual' }
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeSubscriptionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ price: 'price_annual' }]
      })
    );

    await app.close();
  });

  it('rejects invalid billing intervals', async () => {
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/checkout-session',
      payload: { interval: 'weekly' }
    });

    expect(response.statusCode).toBe(400);
    expect(mockStripeCheckoutSessionCreate).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns the billing portal session to the billing profile page', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/portal-session'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripePortalSessionCreate).toHaveBeenCalledWith({
      customer: 'cus_mock',
      return_url: 'http://localhost:3000/profile/billing'
    });

    await app.close();
  });

  it('returns safe Stripe billing details with billing status', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    vi.mocked(userDb.getUserFromDb).mockResolvedValue(
      userFactory.build({
        id: 1,
        name: 'Fallback User',
        email: 'fallback@example.com'
      })
    );
    mockStripeCustomerRetrieve.mockResolvedValue({
      id: 'cus_mock',
      deleted: false,
      name: null,
      email: null,
      invoice_settings: {
        default_payment_method: 'pm_default'
      }
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).billing).toEqual(
      expect.objectContaining({
        hasPaymentMethod: true,
        billingInterval: 'annual',
        billingRate: {
          amount: 4900,
          currency: 'eur',
          interval: 'year',
          intervalCount: 1
        },
        billingDetails: {
          name: 'Fallback User',
          email: 'fallback@example.com',
          cardBrand: 'visa',
          cardLast4: '4242',
          cardExpMonth: 12,
          cardExpYear: 2030
        }
      })
    );
    expect(mockStripeSubscriptionRetrieve).toHaveBeenCalledWith('sub_mock', {
      expand: ['default_payment_method', 'items.data.price']
    });
    expect(mockStripePaymentMethodRetrieve).toHaveBeenCalledWith('pm_default');

    await app.close();
  });

  it('finds the active Stripe subscription by customer when the stored subscription id is missing', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeSubscriptionList).toHaveBeenCalledWith({
      customer: 'cus_mock',
      status: 'all',
      limit: 10,
      expand: ['data.default_payment_method', 'data.items.data.price']
    });
    expect(JSON.parse(response.body).billing).toEqual(
      expect.objectContaining({
        billingRate: {
          amount: 4900,
          currency: 'eur',
          interval: 'year',
          intervalCount: 1
        }
      })
    );

    await app.close();
  });

  it('retrieves the Stripe price when the subscription only has a price id', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue({
      ...mockSubscription,
      items: {
        data: [
          {
            price: { id: 'price_annual' },
            current_period_end: 1_750_604_800
          }
        ]
      }
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripePriceRetrieve).toHaveBeenCalledWith('price_annual');
    expect(JSON.parse(response.body).billing.billingRate).toEqual({
      amount: 4900,
      currency: 'eur',
      interval: 'year',
      intervalCount: 1
    });

    await app.close();
  });

  it('retrieves the Stripe price when the subscription item price is returned as an id string', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue({
      ...mockSubscription,
      items: {
        data: [
          {
            price: 'price_annual',
            current_period_end: 1_750_604_800
          }
        ]
      }
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripePriceRetrieve).toHaveBeenCalledWith('price_annual');
    expect(JSON.parse(response.body).billing.billingRate).toEqual({
      amount: 4900,
      currency: 'eur',
      interval: 'year',
      intervalCount: 1
    });

    await app.close();
  });

  it('falls back to the Stripe subscription item plan when price is unavailable', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue({
      ...mockSubscription,
      items: {
        data: [
          {
            plan: {
              id: 'price_annual',
              amount: 4900,
              currency: 'eur',
              interval: 'year',
              interval_count: 1
            },
            current_period_end: 1_750_604_800
          }
        ]
      }
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).billing).toEqual(
      expect.objectContaining({
        billingInterval: 'annual',
        billingRate: {
          amount: 4900,
          currency: 'eur',
          interval: 'year',
          intervalCount: 1
        }
      })
    );

    await app.close();
  });

  it('returns the exact billing rate from the latest invoice when subscription price is incomplete', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue({
      ...mockSubscription,
      items: {
        data: [
          {
            price: {},
            current_period_end: 1_750_604_800
          }
        ]
      }
    });
    mockStripeInvoicesList.mockResolvedValue({
      data: [
        {
          lines: {
            data: [
              {
                price: 'price_annual'
              }
            ]
          }
        }
      ]
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeInvoicesList).toHaveBeenCalledWith({
      customer: 'cus_mock',
      limit: 10
    });
    expect(mockStripePriceRetrieve).toHaveBeenCalledWith('price_annual');
    expect(JSON.parse(response.body).billing).toEqual(
      expect.objectContaining({
        billingRate: {
          amount: 4900,
          currency: 'eur',
          interval: 'year',
          intervalCount: 1
        }
      })
    );

    await app.close();
  });

  it('returns the latest invoice line amount when no invoice price is available', async () => {
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: 'sub_mock',
      userId: 1
    });
    mockStripeSubscriptionRetrieve.mockResolvedValue({
      ...mockSubscription,
      items: {
        data: [
          {
            price: {},
            current_period_end: 1_750_604_800
          }
        ]
      }
    });
    mockStripeInvoicesList.mockResolvedValue({
      data: [
        {
          lines: {
            data: [
              {
                amount: 4900,
                currency: 'eur',
                period: {
                  start: 1_735_689_600,
                  end: 1_767_225_600
                }
              }
            ]
          }
        }
      ]
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).billing.billingRate).toEqual({
      amount: 4900,
      currency: 'eur',
      interval: 'year',
      intervalCount: 1
    });

    await app.close();
  });

  it('recovers the Stripe subscription from completed checkout sessions', async () => {
    vi.mocked(paymentDb.getBillingStatusFromDb).mockResolvedValue({
      ...eligibleBilling,
      subscriptionStatus: 'active',
      hasPaidAccess: true
    });
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    mockStripeSubscriptionList.mockResolvedValue({
      data: []
    });
    mockStripeCheckoutSessionList.mockResolvedValue({
      data: [
        {
          id: 'cs_mock',
          mode: 'subscription',
          status: 'complete',
          subscription: mockSubscription
        }
      ]
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeCheckoutSessionList).toHaveBeenCalledWith({
      customer: 'cus_mock',
      status: 'complete',
      limit: 10,
      expand: ['data.subscription', 'data.subscription.items.data.price']
    });
    expect(
      vi.mocked(paymentDb.updateStripeSubscriptionForUserInDb)
    ).toHaveBeenCalledWith(1, 'sub_mock');
    expect(JSON.parse(response.body).billing).toEqual(
      expect.objectContaining({
        billingInterval: 'annual',
        billingRate: {
          amount: 4900,
          currency: 'eur',
          interval: 'year',
          intervalCount: 1
        }
      })
    );

    await app.close();
  });

  it('recovers the Stripe subscription from user metadata search', async () => {
    vi.mocked(paymentDb.getBillingStatusFromDb).mockResolvedValue({
      ...eligibleBilling,
      subscriptionStatus: 'active',
      hasPaidAccess: true
    });
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    mockStripeSubscriptionList.mockResolvedValue({
      data: []
    });
    mockStripeCheckoutSessionList.mockResolvedValue({
      data: []
    });
    mockStripeSubscriptionSearch.mockResolvedValue({
      data: [mockSubscription]
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(mockStripeSubscriptionSearch).toHaveBeenCalledWith({
      query: "metadata['userId']:'1'",
      limit: 10,
      expand: ['data.default_payment_method', 'data.items.data.price']
    });
    expect(
      vi.mocked(paymentDb.updateStripeSubscriptionForUserInDb)
    ).toHaveBeenCalledWith(1, 'sub_mock');
    expect(JSON.parse(response.body).billing.billingRate).toEqual({
      amount: 4900,
      currency: 'eur',
      interval: 'year',
      intervalCount: 1
    });

    await app.close();
  });

  it('clears stale active billing when Stripe has no subscription', async () => {
    vi.mocked(paymentDb.getBillingStatusFromDb)
      .mockResolvedValueOnce({
        ...eligibleBilling,
        subscriptionStatus: 'active',
        hasPaidAccess: true
      })
      .mockResolvedValueOnce({
        ...eligibleBilling,
        subscriptionStatus: null,
        hasPaidAccess: false
      });
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    mockStripeSubscriptionList.mockResolvedValue({
      data: []
    });
    mockStripeCheckoutSessionList.mockResolvedValue({
      data: []
    });
    mockStripeSubscriptionSearch.mockResolvedValue({
      data: []
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/1/billing'
    });

    expect(response.statusCode).toBe(200);
    expect(paymentDb.updateBillingStatusInDb).toHaveBeenCalledWith(1, {
      subscriptionStatus: null,
      trialEndsAt: null,
      subscriptionGraceEndsAt: null,
      subscriptionCurrentPeriodEndsAt: null,
      subscriptionCancelAt: null,
      paymentSuccessPending: false
    });
    expect(paymentDb.updateStripeSubscriptionForUserInDb).toHaveBeenCalledWith(
      1,
      null
    );
    expect(JSON.parse(response.body).billing).toEqual({
      ...eligibleBilling,
      subscriptionStatus: null,
      hasPaidAccess: false,
      billingInterval: null,
      hasPaymentMethod: true,
      billingDetails: {
        name: 'Test Customer',
        email: 'billing@example.com',
        cardBrand: 'visa',
        cardLast4: '4242',
        cardExpMonth: 12,
        cardExpYear: 2030
      }
    });

    await app.close();
  });

  it('confirms checkout success when Stripe returns an expanded subscription', async () => {
    vi.mocked(paymentDb.getBillingStatusFromDb)
      .mockResolvedValueOnce({
        ...eligibleBilling,
        paymentSuccessPending: true
      })
      .mockResolvedValueOnce({
        ...eligibleBilling,
        subscriptionStatus: 'active',
        hasPaidAccess: true,
        paymentSuccessPending: true
      });
    vi.mocked(paymentDb.getStripeAccountFromDb).mockResolvedValue({
      id: 1,
      stripeCustomerId: 'cus_mock',
      stripeSubscriptionId: null,
      userId: 1
    });
    vi.mocked(paymentDb.consumePaymentSuccessPendingInDb).mockResolvedValue({
      ...eligibleBilling,
      subscriptionStatus: 'active',
      hasPaidAccess: true,
      paymentSuccessPending: false
    });
    mockStripeCheckoutSessionRetrieve.mockResolvedValue({
      id: 'cs_mock',
      status: 'complete',
      customer: 'cus_mock',
      subscription: {
        ...mockSubscription,
        status: 'active',
        trial_start: null,
        trial_end: null
      }
    });
    const app = await createPaymentTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/1/billing/consume-payment-success',
      payload: {
        trial: false,
        sessionId: 'cs_mock'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(paymentDb.updateStripeSubscriptionForUserInDb).toHaveBeenCalledWith(
      1,
      'sub_mock'
    );
    expect(JSON.parse(response.body)).toEqual({
      canShowPaymentSuccess: true,
      billing: {
        ...eligibleBilling,
        subscriptionStatus: 'active',
        hasPaidAccess: true,
        paymentSuccessPending: false
      }
    });

    await app.close();
  });
});
