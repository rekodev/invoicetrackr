import { getRequestConfig } from 'next-intl/server';

import { auth } from '@/auth';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const session = await auth();
  const locale = session?.user?.language
    ? session.user.language.toLowerCase()
    : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
