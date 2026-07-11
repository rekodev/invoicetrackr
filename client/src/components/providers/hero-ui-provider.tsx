'use client';

import { RouterProvider, ToastProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export function HeroUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <ToastProvider />
      <div className="flex min-h-screen flex-col justify-between">
        {children}
      </div>
    </RouterProvider>
  );
}
