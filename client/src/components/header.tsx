import { auth } from '@/auth';
import { getUser } from '@/api';
import { isResponseError } from '@/lib/utils/error';

import GuestHeader from './ui/guest-header';
import UserHeader from './ui/user-header';

export default async function Header() {
  const session = await auth();

  if (!session?.user?.id) return <GuestHeader />;

  const response = await getUser(Number(session?.user.id));

  if (isResponseError(response)) return <GuestHeader />;

  return <UserHeader user={response.data.user} />;
}
