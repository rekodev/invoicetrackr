import { unauthorized } from 'next/navigation';

import { auth } from '@/auth';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

import RenewSubscriptionPageContent from './renew-subscription';

export default async function RenewSubscriptionPage() {
  const session = await auth();

  if (!session?.user.id) return null;

  const userResp = await getUser(Number(session.user.id));

  if (isResponseError(userResp)) unauthorized();

  return <RenewSubscriptionPageContent user={userResp.data.user} />;
}
