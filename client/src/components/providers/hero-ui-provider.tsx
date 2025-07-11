'use client';

import { HeroUIProvider as HeroUIProviderFromLib } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export function HeroUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProviderFromLib
      navigate={router.push}
      className="flex min-h-screen flex-col justify-between"
    >
      {children}
    </HeroUIProviderFromLib>
  );
}
