import { auth } from '@/auth';

import GuestHeader from './ui/guest-header';
import UserHeader from './ui/user-header';

const Header = async () => {
  const user = await auth();

  if (!user) return <GuestHeader />;

  return <UserHeader />;
};

export default Header;
