'use client';

import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext
} from 'react';
import type { AnalyticsConsentStatus } from '@invoicetrackr/types';

type AnalyticsConsentContextValue = {
  consentStatus?: AnalyticsConsentStatus | null;
  setConsentStatus: Dispatch<
    SetStateAction<AnalyticsConsentStatus | null | undefined>
  >;
};

export const AnalyticsConsentContext = createContext<
  AnalyticsConsentContextValue | undefined
>(undefined);

export const useAnalyticsConsent = () => {
  const context = useContext(AnalyticsConsentContext);

  if (!context) {
    throw new Error(
      'useAnalyticsConsent must be used within AnalyticsProvider'
    );
  }

  return context;
};
