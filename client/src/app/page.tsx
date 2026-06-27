import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

import {
  getFaqJsonLd,
  getOrganizationJsonLd,
  getSoftwareApplicationJsonLd,
  getWebsiteJsonLd
} from '@/lib/seo/structured-data';
import JsonLd from '@/components/seo/json-ld';
import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';

import HomePageContent from './home/home-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getSeoLocale(await getLocale());

  return getPageMetadata('home', locale);
}

export default async function Home() {
  const locale = getSeoLocale(await getLocale());
  const t = await getTranslations('home.faq.items');
  const seoT = await getTranslations('seo.home');
  const faqItems = ['free', 'export', 'payments', 'languages'].map((key) => ({
    question: t(`${key}.question`),
    answer: t(`${key}.answer`)
  }));
  const featureList = seoT.raw('features') as string[];

  return (
    <>
      <JsonLd
        data={[
          getOrganizationJsonLd(),
          getWebsiteJsonLd(locale),
          getSoftwareApplicationJsonLd({ locale, featureList }),
          getFaqJsonLd(faqItems)
        ]}
      />
      <HomePageContent />
    </>
  );
}
