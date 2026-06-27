'use server';

import type { AnalyticsConsentStatus } from '@invoicetrackr/types';
import { cookies } from 'next/headers';

import { auth } from '@/auth';
import { updateUserAnalyticsConsent } from '@/api/user';

import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_MAX_AGE
} from '../analytics/constants';
import { isResponseError } from '../utils/error';
import { updateSessionAction } from '../actions';

export async function updateAnalyticsConsentAction(
  analyticsConsentStatus: AnalyticsConsentStatus
) {
  const cookieStore = await cookies();

  cookieStore.set(ANALYTICS_CONSENT_COOKIE, analyticsConsentStatus, {
    path: '/',
    maxAge: ANALYTICS_CONSENT_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!userId) {
    return { ok: true, analyticsConsentStatus };
  }

  const response = await updateUserAnalyticsConsent(
    userId,
    analyticsConsentStatus
  );

  if (isResponseError(response)) {
    return {
      ok: false,
      analyticsConsentStatus,
      message: response.data.message
    };
  }

  await updateSessionAction({
    newSession: {
      analyticsConsentStatus,
      analyticsConsentUpdatedAt: new Date().toISOString()
    }
  });

  return { ok: true, analyticsConsentStatus };
}
