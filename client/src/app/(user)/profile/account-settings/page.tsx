import AccountSettingsForm from '@/components/profile/account-settings-form';
import { BillingStatus } from '@invoicetrackr/types';
import { auth } from '@/auth';
import { getBillingStatus } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

const AccountSettingsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const billingResp = await getBillingStatus(Number(session.user.id));
  const billing: BillingStatus | {} = isResponseError(billingResp)
    ? {}
    : billingResp.data.billing;

  return (
    <AccountSettingsForm
      key={`${session.user.language}-${session.user.currency}-${session.user.isVatPayer}`}
      user={{
        ...session.user,
        ...billing
      }}
    />
  );
};

export default AccountSettingsPage;
