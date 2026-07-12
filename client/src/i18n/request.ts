import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { resolveLocale } from './resolve-locale';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeFromCookies = cookieStore.get('locale')?.value;

  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  const locale = resolveLocale(localeFromCookies, acceptLanguage);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
