import SubscriptionStatusCard from '@/components/profile/subscription-status-card';

import { auth } from '@/auth';
import { getBillingStatus } from '@/api/payment';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) return null;

  const billingResp = await getBillingStatus(Number(session.user.id));
  const billing = isResponseError(billingResp) ? {} : billingResp.data.billing;

  return (
    <SubscriptionStatusCard
      user={{ ...session.user, ...billing }}
      currency={getCurrencySymbol(session.user.currency)}
    />
  );
}
