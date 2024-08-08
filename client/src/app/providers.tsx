import { NextUIProvider } from '@nextui-org/react';

import SWRProvider from '@/components/swr-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className='flex flex-col min-h-screen justify-between'>
      <SWRProvider>{children}</SWRProvider>
    </NextUIProvider>
  );
}
