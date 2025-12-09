import AccountSettingsForm from '@/components/profile/account-settings-form';
import { auth } from '@/auth';

const AccountSettingsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const { subscriptionStatus } = session.user;

  return (
    <AccountSettingsForm
      key={`${session.user.language}-${session.user.currency}`}
      user={session.user}
      subscriptionStatus={subscriptionStatus}
    />
  );
};

export default AccountSettingsPage;
