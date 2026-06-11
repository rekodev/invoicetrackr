import MerchantPaymentStatusCard from '@/components/profile/merchant-payment-status-card';

import { auth } from '@/auth';
import { getMerchantPaymentStatus } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

type SearchParams = Promise<{
  connect?: string;
}>;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InvoicePaymentsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) return null;

  const { connect } = await searchParams;
  const merchantPaymentResp = await getMerchantPaymentStatus(
    Number(session.user.id)
  );
  const merchantPayment = isResponseError(merchantPaymentResp)
    ? undefined
    : merchantPaymentResp.data.merchantPayment;

  return (
    <MerchantPaymentStatusCard
      userId={Number(session.user.id)}
      merchantPayment={merchantPayment}
      refreshOnReturn={connect === 'return' || connect === 'refresh'}
    />
  );
}
