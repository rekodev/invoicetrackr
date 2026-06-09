import MerchantPaymentStatusCard from '@/components/profile/merchant-payment-status-card';
import SubscriptionStatusCard from '@/components/profile/subscription-status-card';

import { getBillingStatus, getMerchantPaymentStatus } from '@/api/payment';
import { auth } from '@/auth';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) return null;

  const [billingResp, merchantPaymentResp] = await Promise.all([
    getBillingStatus(Number(session.user.id)),
    getMerchantPaymentStatus(Number(session.user.id))
  ]);
  const billing = isResponseError(billingResp) ? {} : billingResp.data.billing;
  const merchantPayment = isResponseError(merchantPaymentResp)
    ? undefined
    : merchantPaymentResp.data.merchantPayment;

  return (
    <div className="flex flex-col gap-6">
      <SubscriptionStatusCard
        user={{ ...session.user, ...billing }}
        currency={getCurrencySymbol(session.user.currency)}
      />
      <MerchantPaymentStatusCard
        userId={Number(session.user.id)}
        merchantPayment={merchantPayment}
      />
    </div>
  );
}
