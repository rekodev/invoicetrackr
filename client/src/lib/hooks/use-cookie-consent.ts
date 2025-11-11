'use client';

import { useEffect, useState } from 'react';
import { CookieConsentStatus } from '../types';

export default function useCookieConsent() {
  const [cookieConsent, setCookieConsent] = useState<
    CookieConsentStatus | null | undefined
  >(undefined);

  const updateCookieConsent = (consent: CookieConsentStatus) => {
    localStorage.setItem('cookie-consent', consent);
    setCookieConsent(consent);
  };

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCookieConsent(consent as CookieConsentStatus | null);
  }, []);

  useEffect(() => {
    if (cookieConsent === undefined) return;

    const analyticsStorage =
      cookieConsent === CookieConsentStatus.Accepted ? 'granted' : 'denied';

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsStorage
      });
    }
  }, [cookieConsent]);

  return { cookieConsent, updateCookieConsent };
}
