import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice App',
  description: 'Invoice generating and tracking',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const bgGradient =
    'bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900 from-[-35%] via-black to-black';

  return (
    <html lang='en' className='dark'>
      <body className={(inter.className, bgGradient)}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
