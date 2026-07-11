import { DEFAULT_CURRENCY } from '@invoicetrackr/types';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';

import FreeInvoiceForm from '@/components/invoice/free-invoice-form';
import JsonLd from '@/components/seo/json-ld';
import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';
import {
  getSoftwareApplicationJsonLd,
  getWebsiteJsonLd
} from '@/lib/seo/structured-data';

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

  const currency = DEFAULT_CURRENCY;

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
