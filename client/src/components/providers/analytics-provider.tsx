'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { AnalyticsConsentStatus } from '@invoicetrackr/types';

import {
  CREATE_INVOICE_PAGE,
  HOME_PAGE,
  SIGN_UP_PAGE
} from '@/lib/constants/pages';
import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  resetAnalyticsUser,
  setAnalyticsConsent
} from '@/lib/analytics/client';
import { ANALYTICS_CONSENT_CHANGED_EVENT } from '@/lib/analytics/constants';
import { analyticsEvents } from '@/lib/analytics/events';
import { updateAnalyticsConsentAction } from '@/lib/actions/analytics';

type Props = {
  consentStatus?: AnalyticsConsentStatus | null;
  userConsentStatus?: AnalyticsConsentStatus | null;
  userId?: string | null;
};

export default function AnalyticsProvider({
  consentStatus,
  userConsentStatus,
  userId
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentConsentStatus, setCurrentConsentStatus] =
    useState(consentStatus);
  const [hasSyncedUserConsent, setHasSyncedUserConsent] = useState(false);
  const hasConsent = currentConsentStatus === 'accepted';

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      setCurrentConsentStatus(
        (event as CustomEvent<AnalyticsConsentStatus>).detail
      );
    };

    window.addEventListener(
      ANALYTICS_CONSENT_CHANGED_EVENT,
      handleConsentChange
    );

    return () =>
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGED_EVENT,
        handleConsentChange
      );
  }, []);

  useEffect(() => {
    setAnalyticsConsent(hasConsent);

    if (hasConsent) {
      identifyAnalyticsUser(userId);
      return;
    }

    resetAnalyticsUser();
  }, [hasConsent, userId]);

  useEffect(() => {
    if (
      !hasConsent ||
      !userId ||
      userConsentStatus === 'accepted' ||
      hasSyncedUserConsent
    )
      return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSyncedUserConsent(true);
    void updateAnalyticsConsentAction('accepted');
  }, [hasConsent, hasSyncedUserConsent, userConsentStatus, userId]);

  useEffect(() => {
    if (!hasConsent || !pathname) return;

    const authState = userId ? 'authenticated' : 'anonymous';

    if (pathname === HOME_PAGE) {
      captureAnalyticsEvent(analyticsEvents.landingPageViewed, {
        auth_state: authState
      });
    }

    if (pathname === CREATE_INVOICE_PAGE) {
      captureAnalyticsEvent(analyticsEvents.freeInvoiceGeneratorOpened, {
        auth_state: authState
      });
    }

    if (pathname === SIGN_UP_PAGE) {
      captureAnalyticsEvent(analyticsEvents.signUpStarted, {
        auth_state: authState
      });
    }
  }, [hasConsent, pathname, searchParams, userId]);

  return null;
}
