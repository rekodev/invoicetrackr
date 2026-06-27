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

import CookieConsent from '../components/cookie-consent';
import Loading from './loading';
import { Providers } from '../components/providers/providers';
import RouteAmbientBackground from './route-ambient-background';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: 'InvoiceTrackr',
  description:
    'Create professional invoices, track payments, and monitor income for freelancers and small businesses.',
  keywords: [
    'invoicing',
    'invoice generator',
    'billing',
    'payments',
    'income tracking',
    'small business',
    'freelancer'
  ],
  authors: [{ name: 'InvoiceTrackr' }],
  creator: 'InvoiceTrackr',
  openGraph: {
    type: 'website',
    siteName: 'InvoiceTrackr',
    title: 'InvoiceTrackr',
    description:
      'Create professional invoices, track payments, and monitor income for freelancers and small businesses.',
    url: '/'
  },
  alternates: {
    canonical: '/'
  }
};

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
      <body className={inter.className}>
        <Providers messages={messages}>
          <Suspense fallback={null}>
            <AnalyticsProvider
              consentStatus={consentStatus}
              userConsentStatus={session?.user?.analyticsConsentStatus}
              userId={session?.user?.id}
            />
          </Suspense>
          <RouteAmbientBackground />
          <Header />
          <main className="mx-auto flex w-full flex-grow flex-col">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
