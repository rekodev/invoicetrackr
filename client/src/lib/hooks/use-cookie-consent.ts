'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsConsentStatus } from '@invoicetrackr/types';

import {
  ANALYTICS_CONSENT_COOKIE,
  analyticsConsentStatuses
} from '../analytics/constants';
import { useAnalyticsConsent } from '../analytics/consent-context';

const getConsentCookie = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));
  const value = cookie?.split('=').at(1);

  return value && analyticsConsentStatuses.has(value as AnalyticsConsentStatus)
    ? (value as AnalyticsConsentStatus)
    : null;
};

export default function useCookieConsent() {
  const {
    consentStatus: analyticsConsentStatus,
    setConsentStatus: setAnalyticsConsentStatus
  } = useAnalyticsConsent();
  const [cookieConsent, setCookieConsent] = useState<
    AnalyticsConsentStatus | null | undefined
  >(analyticsConsentStatus);

  const updateCookieConsent = (consent: AnalyticsConsentStatus) => {
    setCookieConsent(consent);
    setAnalyticsConsentStatus(consent);
  };

  useEffect(() => {
    if (analyticsConsentStatus !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCookieConsent(analyticsConsentStatus);
      return;
    }

    setCookieConsent(getConsentCookie());
  }, [analyticsConsentStatus]);

  return { cookieConsent, updateCookieConsent };
}
