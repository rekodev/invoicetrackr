import { NextRequest, NextResponse } from 'next/server';

import { DASHBOARD_PAGE, PAYMENT_SUCCESS_PAGE } from '@/lib/constants/pages';
import { auth, unstable_update } from '@/auth';
import { consumePaymentSuccess } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id)
    return NextResponse.redirect(new URL(DASHBOARD_PAGE, req.url));

  const isTrial = req.nextUrl.searchParams.get('trial') === 'true';
  const isCheckout = req.nextUrl.searchParams.get('checkout') === 'true';
  const sessionId = req.nextUrl.searchParams.get('session_id') || undefined;

  if (!isTrial && !isCheckout)
    return NextResponse.redirect(new URL(DASHBOARD_PAGE, req.url));

  const response = await consumePaymentSuccess({
    userId: Number(session.user.id),
    trial: isTrial,
    sessionId
  });

  if (isResponseError(response) || !response.data.canShowPaymentSuccess)
    return NextResponse.redirect(new URL(DASHBOARD_PAGE, req.url));

  if (response.data.billing) {
    await unstable_update({
      user: {
        ...session.user,
        isOnboarded: !!response.data.billing.onboardingCompletedAt,
        ...response.data.billing
      }
    });
  }

  const successUrl = new URL(PAYMENT_SUCCESS_PAGE, req.url);
  successUrl.searchParams.set(isTrial ? 'trial' : 'checkout', 'true');
  successUrl.searchParams.set('confirmed', 'true');

  return NextResponse.redirect(successUrl);
}
