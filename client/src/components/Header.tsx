import { auth } from '@/auth';

import GuestHeader from './ui/guest-header';
import UserHeader from './ui/user-header';

const Header = async () => {
  const session = await auth();

  if (!session?.user?.id) return <GuestHeader />;

  return <UserHeader userId={Number(session.user.id)} />;
};

export default Header;
