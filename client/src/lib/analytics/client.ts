'use client';

import posthog from 'posthog-js';

import type { AnalyticsEvent, AnalyticsProperties } from './events';

let isInitialized = false;

export const initializeAnalytics = () => {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || isInitialized) return false;

  posthog.init(key, {
    api_host: host || 'https://eu.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
    opt_out_capturing_by_default: true
  });

  isInitialized = true;

  return true;
};

export const setAnalyticsConsent = (isAccepted: boolean) => {
  if (isAccepted) {
    if (!initializeAnalytics()) return;

    posthog.opt_in_capturing();
    return;
  }

  if (!isInitialized) return;

  posthog.opt_out_capturing();
};

export const identifyAnalyticsUser = (userId?: string | null) => {
  if (!userId || !initializeAnalytics() || !posthog.has_opted_in_capturing())
    return;

  posthog.identify(`user:${userId}`);
};

export const resetAnalyticsUser = () => {
  if (!isInitialized) return;

  posthog.reset();
};

export const captureAnalyticsEvent = (
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
) => {
  if (!initializeAnalytics() || !posthog.has_opted_in_capturing()) return;

  posthog.capture(event, properties);
};
