import { unauthorized } from 'next/navigation';

import MultiStepForm from '@/components/multi-step-form';
import { auth } from '@/auth';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  const userResp = await getUser(userId);

  if (isResponseError(userResp)) unauthorized();

  return <MultiStepForm existingUserData={userResp.data.user} />;
}
