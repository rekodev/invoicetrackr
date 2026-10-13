'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function useListNavigation<Query extends object>(
  query: Query,
  toHref: (_query: Query) => string
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const update = (
    patch: Partial<Query>,
    history: 'push' | 'replace' = 'push'
  ) =>
    startTransition(() => {
      router[history](toHref({ ...query, ...patch }), { scroll: false });
    });

  return { update, isPending };
}
