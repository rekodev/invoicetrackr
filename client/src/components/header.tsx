import { getUser } from '@/api';
import { auth } from '@/auth';

import GuestHeader from './ui/guest-header';
import UserHeader from './ui/user-header';

export default async function Header() {
  const session = await auth();

  if (!session?.user?.id) return <GuestHeader />;

  const response = await getUser(Number(session?.user.id));

  return <UserHeader user={response.data} />;
}
