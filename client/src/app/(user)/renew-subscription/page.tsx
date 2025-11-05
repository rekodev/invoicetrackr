import { unauthorized } from 'next/navigation';

import { getUser } from '@/api';
import { auth } from '@/auth';
import { isResponseError } from '@/lib/utils/error';

import RenewSubscription from './renew-subscription';

export default async function RenewSubscriptionPage() {
  const session = await auth();

  if (!session?.user.id) return null;

  const userResp = await getUser(Number(session.user.id));

  if (isResponseError(userResp)) unauthorized();

  return <RenewSubscription user={userResp.data} />;
}
