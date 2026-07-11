import { appBaseUrl } from '@/lib/config/app';

import { getAbsoluteUrl, SeoLocale, siteName } from './site';

type FaqItem = {
  question: string;
  answer: string;
};

export const getOrganizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${appBaseUrl}/#organization`,
  name: siteName,
  url: appBaseUrl,
  logo: getAbsoluteUrl('/logo.png')
});

export const getWebsiteJsonLd = (locale: SeoLocale) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${appBaseUrl}/#website`,
  name: siteName,
  url: appBaseUrl,
  inLanguage: locale === 'lt' ? 'lt-LT' : 'en',
  publisher: {
    '@id': `${appBaseUrl}/#organization`
  }
});

export const getSoftwareApplicationJsonLd = ({
  locale,
  featureList
}: {
  locale: SeoLocale;
  featureList: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${appBaseUrl}/#software`,
  name: siteName,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: appBaseUrl,
  inLanguage: locale === 'lt' ? ['lt-LT', 'en'] : ['en', 'lt-LT'],
  featureList
});

export const getFaqJsonLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
});
