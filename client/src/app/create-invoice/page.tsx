import { cookies, headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import {
  getSoftwareApplicationJsonLd,
  getWebsiteJsonLd
} from '@/lib/seo/structured-data';
import FreeInvoiceForm from '@/components/invoice/free-invoice-form';
import JsonLd from '@/components/seo/json-ld';
import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getSeoLocale(await getLocale());

  return getPageMetadata('createInvoice', locale);
}

export default async function CreateInvoicePage() {
  const cookieStore = await cookies();
  const language = cookieStore.get('locale')?.value || 'en';
  const seoLocale = getSeoLocale(language);
  const seoT = await getTranslations('seo.home');
  const featureList = seoT.raw('features') as string[];

  const headersList = await headers();
  const acceptLanguage = headersList.get('Accept-Language') || 'en-US,en;q=0.9';

  const locale = acceptLanguage
    .split(',')[0]
    .split(';')[0]
    .substring(0, 2)
    .toLowerCase();

  const currency = language === 'lt' ? 'eur' : locale === 'en' ? 'usd' : 'eur';

  return (
    <>
      <JsonLd
        data={[
          getWebsiteJsonLd(seoLocale),
          getSoftwareApplicationJsonLd({
            locale: seoLocale,
            featureList
          })
        ]}
      />
      <FreeInvoiceForm language={language} currency={currency} />
    </>
  );
}
