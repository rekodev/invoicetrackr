import { auth } from '@/auth';

import PaymentSuccessContent from './payment-success-content';

type SearchParams = Promise<{
  checkout?: string;
  confirmed?: string;
  trial?: string;
}>;

export default async function PaymentSuccessPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user?.id) return null;

  const { checkout, confirmed, trial } = await searchParams;
  const isTrial = trial === 'true';
  const isCheckout = checkout === 'true';

  if ((!isTrial && !isCheckout) || confirmed !== 'true') return null;

  return <PaymentSuccessContent isTrial={isTrial} billing={session.user} />;
}
