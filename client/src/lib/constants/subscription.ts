export const SUBSCRIPTION_AMOUNT = 4.99 as const;
export const SUBSCRIPTION_ANNUAL_AMOUNT = 49 as const;
export const SUBSCRIPTION_CURRENCY = 'EUR' as const;
export const SUBSCRIPTION_CURRENCY_SYMBOL = '€' as const;
export const SUBSCRIPTION_MONTHLY_EQUIVALENT_AMOUNT = 4.08 as const;

export const formatSubscriptionPrice = (amount: number) =>
  `${SUBSCRIPTION_CURRENCY_SYMBOL}${amount}`;
