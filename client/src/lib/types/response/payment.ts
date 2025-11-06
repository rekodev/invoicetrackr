export type CreateCustomerResp = { customerId: string; message: string };

export type CreateSubscriptionResp = {
  type: string;
  clientSecret: string;
  message: string;
};

export type GetStripeCustomerIdResp = { customerId: string };

export type CancelStripeSubscriptionResp = { message: string };
