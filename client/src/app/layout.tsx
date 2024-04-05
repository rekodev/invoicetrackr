import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice App',
  description: 'Invoice generating and tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className='flex-grow flex flex-col max-w-5xl p-6 mx-auto w-full'>
            <Breadcrumbs />
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}