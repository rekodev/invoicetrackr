'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { AnalyticsConsentStatus } from '@invoicetrackr/types';

import { CREATE_INVOICE_PAGE, HOME_PAGE } from '@/lib/constants/pages';
import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  resetAnalyticsUser,
  setAnalyticsConsent
} from '@/lib/analytics/client';
import { AnalyticsConsentContext } from '@/lib/analytics/consent-context';
import { analyticsEvents } from '@/lib/analytics/events';
import { updateAnalyticsConsentAction } from '@/lib/actions/analytics';

type Props = {
  children: ReactNode;
  consentStatus?: AnalyticsConsentStatus | null;
  userConsentStatus?: AnalyticsConsentStatus | null;
  userId?: string | null;
};

export default function AnalyticsProvider({
  children,
  consentStatus,
  userConsentStatus,
  userId
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentConsentStatus, setCurrentConsentStatus] =
    useState(consentStatus);
  const [hasSyncedUserConsent, setHasSyncedUserConsent] = useState(false);
  const lastCapturedRouteKeyRef = useRef<string | null>(null);
  const hasConsent = currentConsentStatus === 'accepted';
  const contextValue = useMemo(
    () => ({
      consentStatus: currentConsentStatus,
      setConsentStatus: setCurrentConsentStatus
    }),
    [currentConsentStatus]
  );

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
    const search = searchParams?.toString();
    const routeKey = [pathname, search, authState].filter(Boolean).join('|');

    if (pathname === HOME_PAGE) {
      if (lastCapturedRouteKeyRef.current === routeKey) return;

      lastCapturedRouteKeyRef.current = routeKey;
      captureAnalyticsEvent(analyticsEvents.landingPageViewed, {
        auth_state: authState
      });
      return;
    }

    if (pathname === CREATE_INVOICE_PAGE) {
      if (lastCapturedRouteKeyRef.current === routeKey) return;

      lastCapturedRouteKeyRef.current = routeKey;
      captureAnalyticsEvent(analyticsEvents.freeInvoiceGeneratorOpened, {
        auth_state: authState
      });
    }
  }, [hasConsent, pathname, searchParams, userId]);

  return (
    <AnalyticsConsentContext.Provider value={contextValue}>
      {children}
    </AnalyticsConsentContext.Provider>
  );
}
