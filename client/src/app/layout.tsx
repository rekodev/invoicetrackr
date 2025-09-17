import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import './globals.css';

import Footer from '@/components/footer';
import Header from '@/components/header';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InvoiceTrackr',
  description: 'Invoice generating and tracking'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <div className="bg-radial-[at_0%_100%] fixed inset-0 -z-10 min-h-screen from-purple-900 from-[-35%] via-transparent to-transparent" />
        <Providers messages={messages}>
          <Header />
          <main className="mx-auto flex w-full flex-grow flex-col py-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
