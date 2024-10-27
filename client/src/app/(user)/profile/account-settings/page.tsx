import { auth } from '@/auth';
import AccountSettingsForm from '@/components/profile/account-settings-form';

const AccountSettingsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AccountSettingsForm userId={Number(session?.user?.id)} />;
};

export default AccountSettingsPage;
