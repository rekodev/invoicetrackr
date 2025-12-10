import AccountSettingsForm from '@/components/profile/account-settings-form';
import { auth } from '@/auth';

const AccountSettingsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <AccountSettingsForm
      key={`${session.user.language}-${session.user.currency}`}
      user={session.user}
    />
  );
};

export default AccountSettingsPage;
