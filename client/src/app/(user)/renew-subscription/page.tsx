import { getUser } from '@/api';
import { auth } from '@/auth';

import RenewSubscription from './renew-subscription';

export default async function RenewSubscriptionPage() {
  const session = await auth();

  if (!session?.user.id) return null;

  const { data: user } = await getUser(Number(session.user.id));

  return <RenewSubscription user={user} />;
}
