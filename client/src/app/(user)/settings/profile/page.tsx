import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import PersonalInformationForm from '@/components/profile/personal-information-form';
import PageHeader from '@/components/ui/page-header';
import { isResponseError } from '@/lib/utils/error';

async function FreelancerProfilePage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userResp = await getUser(Number(session.user.id));

  if (isResponseError(userResp)) unauthorized();

  const t = await getTranslations('profile.personal_information.form');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('title')} />
      <PersonalInformationForm defaultValues={userResp.data.user} />
    </section>
  );
}

export default FreelancerProfilePage;
