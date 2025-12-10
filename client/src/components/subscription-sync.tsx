'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { syncSubscriptionStatusAction } from '@/lib/actions/user';

type Props = {
  userId: string;
};

export default function SubscriptionSync({ userId }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    syncSubscriptionStatusAction(userId);
  }, [pathname, userId]);

  return null;
}
