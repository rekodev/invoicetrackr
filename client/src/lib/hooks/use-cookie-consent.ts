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

  return { cookieConsent, updateCookieConsent };
}
