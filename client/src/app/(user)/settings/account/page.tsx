import { Card } from '@heroui/react';
import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import AccountDataSection from '@/components/profile/account-data-section';
import LanguageSettingsForm from '@/components/profile/language-settings-form';
import PageHeader from '@/components/ui/page-header';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  searchParams: Promise<{ export_error?: string }>;
};

const AccountPage = async ({ searchParams }: Props) => {
  const { export_error: exportError } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const response = await getUser(Number(session.user.id));
  if (isResponseError(response)) unauthorized();

  const { user } = response.data;
  const t = await getTranslations('profile.account');

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('title')} />
      <Card className="w-full border">
        <Card.Content className="gap-section flex flex-col">
          <LanguageSettingsForm key={session.user.language} user={user} />
          <div className="border-t" />
          <AccountDataSection
            userId={Number(user.id)}
            email={user.email ?? ''}
            hasExportError={exportError === '1'}
          />
        </Card.Content>
      </Card>
    </section>
  );
};

export default AccountPage;
