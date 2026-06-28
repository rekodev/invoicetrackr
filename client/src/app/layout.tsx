import { ReactNode, Suspense } from 'react';
import { getLocale, getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import './globals.css';

import {
  ANALYTICS_CONSENT_COOKIE,
  analyticsConsentStatuses
} from '@/lib/analytics/constants';
import AnalyticsProvider from '@/components/providers/analytics-provider';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { appBaseUrl } from '@/lib/config/app';
import { auth } from '@/auth';
import { getPageMetadata } from '@/lib/seo/metadata';
import { getSeoLocale } from '@/lib/seo/site';

import CookieConsent from '../components/cookie-consent';
import Loading from './loading';
import { Providers } from '../components/providers/providers';
import RouteAmbientBackground from './route-ambient-background';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = getSeoLocale(await getLocale());
  const metadata = await getPageMetadata('home', locale);

  return {
    ...metadata,
    metadataBase: new URL(appBaseUrl),
    title: {
      default: 'InvoiceTrackr',
      template: '%s · InvoiceTrackr'
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const session = await auth();
  const consentCookie = cookieStore.get(ANALYTICS_CONSENT_COOKIE)?.value;
  const consentStatus = analyticsConsentStatuses.has(
    consentCookie as 'accepted' | 'declined'
  )
    ? (consentCookie as 'accepted' | 'declined')
    : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers messages={messages}>
          <Suspense fallback={null}>
            <AnalyticsProvider
              consentStatus={consentStatus}
              userConsentStatus={session?.user?.analyticsConsentStatus}
              userId={session?.user?.id}
            >
              <RouteAmbientBackground />
              <Header />
              <main className="mx-auto flex w-full flex-grow flex-col">
                <Suspense fallback={<Loading />}>{children}</Suspense>
              </main>
              <Footer />
              <CookieConsent />
            </AnalyticsProvider>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
