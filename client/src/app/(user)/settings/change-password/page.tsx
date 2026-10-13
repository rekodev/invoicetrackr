import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import ChangePasswordForm from '@/components/profile/change-password-form';
import PageHeader from '@/components/ui/page-header';

const ChangePasswordPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const t = await getTranslations('profile.change_password');

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('title')} />
      <ChangePasswordForm userId={Number(session.user.id)} />
    </section>
  );
};

export default ChangePasswordPage;
