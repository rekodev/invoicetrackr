import { auth } from '@/auth';

import GuestHeader from './guest-header';

export default async function Header() {
  const session = await auth();

  if (!session?.user?.id) return <GuestHeader />;
  return null;
}
