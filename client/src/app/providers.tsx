import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

import SWRProvider from '@/components/providers/swr-provider';
import { NextUIProvider } from '@/components/providers/next-ui-provider';

type Props = {
  children: ReactNode;
  messages: AbstractIntlMessages;
};

export function Providers({ children, messages }: Props) {
  return (
    <NextIntlClientProvider messages={messages}>
      <NextUIProvider>
        <SWRProvider>{children}</SWRProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
  );
}
