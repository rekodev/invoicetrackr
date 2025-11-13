import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { TermsOfServiceContent } from './terms-of-service-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('terms_of_service');

  return {
    title: t('title'),
    description: t('sections.agreement.content'),
    keywords: [
      'terms of service',
      'legal',
      'agreements',
      'billing',
      'account usage'
    ],
    authors: [{ name: 'InvoiceTrackr' }],
    creator: 'InvoiceTrackr',
    openGraph: {
      type: 'website',
      siteName: 'InvoiceTrackr',
      title: t('title'),
      description: t('sections.agreement.content'),
      url: '/terms-of-service'
    },
    alternates: {
      canonical: '/terms-of-service'
    }
  };
}

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
