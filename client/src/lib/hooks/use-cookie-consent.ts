'use client';

import { useEffect, useState } from 'react';

import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_CONSENT_COOKIE,
  analyticsConsentStatuses
} from '../analytics/constants';
import type { CookieConsentStatus } from '../types';
import { updateAnalyticsConsentAction } from '../actions/analytics';

const getConsentCookie = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));
  const value = cookie?.split('=').at(1);

  return value && analyticsConsentStatuses.has(value as CookieConsentStatus)
    ? (value as CookieConsentStatus)
    : null;
};

export default function useCookieConsent() {
  const [cookieConsent, setCookieConsent] = useState<
    CookieConsentStatus | null | undefined
  >(undefined);

  const updateCookieConsent = async (consent: CookieConsentStatus) => {
    setCookieConsent(consent);
    await updateAnalyticsConsentAction(consent);
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_CONSENT_CHANGED_EVENT, { detail: consent })
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCookieConsent(getConsentCookie());
  }, []);

  return { cookieConsent, updateCookieConsent };
}
