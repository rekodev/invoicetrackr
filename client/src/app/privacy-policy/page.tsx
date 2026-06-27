import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';

import PrivacyPolicyPageContent from './privacy-policy-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getSeoLocale(await getLocale());

  return getPageMetadata('privacyPolicy', locale);
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageContent />;
}
