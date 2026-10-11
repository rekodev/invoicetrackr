import { unauthorized } from 'next/navigation';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import AccountDataSection from '@/components/profile/account-data-section';
import AccountSettingsForm from '@/components/profile/account-settings-form';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  searchParams: Promise<{ export_error?: string }>;
};

const AccountSettingsPage = async ({ searchParams }: Props) => {
  const { export_error: exportError } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const response = await getUser(Number(session.user.id));
  if (isResponseError(response)) unauthorized();

  const { user } = response.data;

  return (
    <div className="flex flex-col gap-6">
      <AccountSettingsForm
        key={`${session.user.language}-${session.user.isVatPayer}`}
        user={user}
      />
      <AccountDataSection
        userId={Number(user.id)}
        email={user.email ?? ''}
        hasExportError={exportError === '1'}
      />
    </div>
  );
};

export default AccountSettingsPage;
