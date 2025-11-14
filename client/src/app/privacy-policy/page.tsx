import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import PrivacyPolicyPageContent from './privacy-policy-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy_policy');

  return {
    title: t('title'),
    description: t('sections.introduction.content'),
    keywords: ['privacy policy', 'cookies', 'data protection', 'analytics'],
    authors: [{ name: 'InvoiceTrackr' }],
    creator: 'InvoiceTrackr',
    openGraph: {
      type: 'website',
      siteName: 'InvoiceTrackr',
      title: t('title'),
      description: t('sections.introduction.content'),
      url: '/privacy-policy'
    },
    alternates: {
      canonical: '/privacy-policy'
    }
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageContent />;
}
