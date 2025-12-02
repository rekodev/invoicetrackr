import { unauthorized } from 'next/navigation';

import { auth } from '@/auth';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

import UserNavCard from './user-nav-card';

export default async function UserNavCardWrapper() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getUser(Number(session.user.id));

  if (isResponseError(response)) unauthorized();

  return <UserNavCard user={response.data.user} />;
}
