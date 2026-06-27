import type { AnalyticsConsentStatus } from '@invoicetrackr/types';

export const ANALYTICS_CONSENT_COOKIE = 'invoiceTrackrAnalyticsConsent';
export const ANALYTICS_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
export const ANALYTICS_CONSENT_CHANGED_EVENT =
  'invoiceTrackrAnalyticsConsentChanged';

export const analyticsConsentStatuses = new Set<AnalyticsConsentStatus>([
  'accepted',
  'declined'
]);
