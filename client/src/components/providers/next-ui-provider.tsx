'use client';

import { HeroUIProvider as HeroUIProviderFromLib } from "@heroui/react";
import { ReactNode } from 'react';

export function HeroUIProvider({ children }: { children: ReactNode }) {
  return (
    <HeroUIProviderFromLib className='flex flex-col min-h-screen justify-between'>
      {children}
    </HeroUIProviderFromLib>
  );
}
