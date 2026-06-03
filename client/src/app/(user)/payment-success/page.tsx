import { redirect } from 'next/navigation';

import { DASHBOARD_PAGE } from '@/lib/constants/pages';
import { auth } from '@/auth';
import { consumePaymentSuccess } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

import PaymentSuccessContent from './payment-success-content';

type SearchParams = Promise<{ checkout?: string; trial?: string }>;

export default async function PaymentSuccessPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user?.id) redirect(DASHBOARD_PAGE);

  const { checkout, trial } = await searchParams;
  const isTrial = trial === 'true';
  const isCheckout = checkout === 'true';

  if (!isTrial && !isCheckout) redirect(DASHBOARD_PAGE);

  const response = await consumePaymentSuccess(
    Number(session.user.id),
    isTrial
  );

  if (isResponseError(response) || !response.data.canShowPaymentSuccess)
    redirect(DASHBOARD_PAGE);

  return <PaymentSuccessContent isTrial={isTrial} />;
}
