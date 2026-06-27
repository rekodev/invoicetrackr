import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SeoLocale, SeoPage, seoPages, siteName } from './site';

export const getSeoCopy = async (page: SeoPage) => {
  const t = await getTranslations(`seo.${page}`);

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[]
  };
};

export const getPageMetadata = async (
  page: SeoPage,
  locale: SeoLocale
): Promise<Metadata> => {
  const config = seoPages[page];
  const copy = await getSeoCopy(page);
  const title = `${copy.title} · ${siteName}`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    alternates: {
      canonical: config.pathname
    },
    openGraph: {
      type: 'website',
      siteName,
      title,
      description: copy.description,
      url: config.pathname,
      locale: locale === 'lt' ? 'lt_LT' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: copy.description
    },
    robots: { index: true, follow: true }
  };
};

export const getNoIndexMetadata = ({
  title,
  description,
  canonical,
  referrer
}: {
  title: string;
  description?: string;
  canonical?: string;
  referrer?: Metadata['referrer'];
}): Metadata => ({
  title,
  description,
  alternates: canonical ? { canonical } : undefined,
  referrer,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
});
