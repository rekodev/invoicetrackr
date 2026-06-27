import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  let locale = 'lt';

  const cookieStore = await cookies();
  const localeFromCookies = cookieStore.get('locale')?.value;

  if (localeFromCookies) locale = localeFromCookies;
  else {
    const headersList = await headers();
    const preferredLanguage = headersList
      .get('accept-language')
      ?.split(',')[0]
      ?.split(';')[0]
      ?.substring(0, 2)
      ?.toLowerCase();

    if (preferredLanguage === 'en') locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
