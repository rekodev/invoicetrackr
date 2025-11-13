import { unauthorized } from 'next/navigation';

import PersonalInformationForm from '@/components/profile/personal-information-form';
import { auth } from '@/auth';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

async function PersonalInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userResp = await getUser(Number(session.user.id));

  if (isResponseError(userResp)) unauthorized();

  return <PersonalInformationForm defaultValues={userResp.data.user} />;
}

export default PersonalInformationPage;
