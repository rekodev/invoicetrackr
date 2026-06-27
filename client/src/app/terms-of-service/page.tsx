import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';

import TermsOfServicePageContent from './terms-of-service-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getSeoLocale(await getLocale());

  return getPageMetadata('terms', locale);
}

export default function TermsOfServicePage() {
  return <TermsOfServicePageContent />;
}
