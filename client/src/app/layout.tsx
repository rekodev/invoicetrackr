import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InvoiceTrackr',
  description: 'Invoice generating and tracking',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const bgGradient =
    'bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900 from-[-35%] via-black to-black';

  return (
    <html lang={locale} className='dark'>
      <body className={(inter.className, bgGradient)}>
        <Providers messages={messages}>
          <Header />
          <main className='flex-grow flex flex-col max-w-6xl p-6 mx-auto w-full'>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
