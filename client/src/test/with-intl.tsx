import { JSX, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import localeMessages from '../../messages/lt.json';

type WithIntlArgs = [
  ReactNode,
  { messages: Partial<typeof localeMessages>; locale?: string }?
];

type WithIntlType = (..._args: WithIntlArgs) => JSX.Element;

export const withIntl: WithIntlType = (
  children,
  options = { messages: {}, locale: 'lt' }
) => {
  const { messages = {}, locale = 'lt' } = options;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ ...localeMessages, ...messages }}
    >
      {children}
    </NextIntlClientProvider>
  );
};
