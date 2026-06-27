export const analyticsEvents = {
  signUpCompleted: 'sign_up_completed',
  onboardingStepCompleted: 'onboarding_step_completed',
  invoiceCreated: 'invoice_created',
  invoiceEmailed: 'invoice_emailed',
  clientCreated: 'client_created',
  bankAccountAdded: 'bank_account_added',
  trialStarted: 'trial_started',
  subscriptionStarted: 'subscription_started',
  paymentFailed: 'payment_failed',
  subscriptionCanceled: 'subscription_canceled'
} as const;

export type AnalyticsEvent =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;
