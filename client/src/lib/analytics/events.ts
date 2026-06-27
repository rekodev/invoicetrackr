export const analyticsEvents = {
  landingPageViewed: 'landing_page_viewed',
  pricingViewed: 'pricing_viewed',
  freeInvoiceGeneratorOpened: 'free_invoice_generator_opened',
  signUpStarted: 'sign_up_started',
  signUpCompleted: 'sign_up_completed',
  onboardingStepCompleted: 'onboarding_step_completed',
  pdfDownloaded: 'pdf_downloaded'
} as const;

export type AnalyticsEvent =
  (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;
