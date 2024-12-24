'use client';

import { NextUIProvider as NextUIProviderFromLib } from '@nextui-org/react';
import { ReactNode } from 'react';

export function NextUIProvider({ children }: { children: ReactNode }) {
  return (
    <NextUIProviderFromLib className='flex flex-col min-h-screen justify-between'>
      {children}
    </NextUIProviderFromLib>
  );
}
