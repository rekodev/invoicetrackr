import { NextUIProvider } from '@nextui-org/react';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

import SWRProvider from '@/components/providers/swr-provider';

type Props = {
  children: ReactNode;
  messages: AbstractIntlMessages;
};

export function Providers({ children, messages }: Props) {
  return (
    <NextIntlClientProvider messages={messages}>
      <NextUIProvider className='flex flex-col min-h-screen justify-between'>
        <SWRProvider>{children}</SWRProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
  );
}
