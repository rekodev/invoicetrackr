import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.

  let locale = 'en';

  const cookieStore = await cookies();
  const localeFromCookies = cookieStore.get('locale')?.value;

  if (localeFromCookies) locale = localeFromCookies;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
